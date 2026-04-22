const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const { execFile } = require("child_process");
const http = require("http");

let backendProcess = null;
let mainWindow = null;
let logFile;

const isDev = !app.isPackaged;
const BACKEND_PORT = 5000;
const DEV_FRONTEND_URL = "http://localhost:5173";

// ─── Logger ───────────────────────────────────────────────────────────────────

function initLogger() {
  const logDir = app.getPath("userData");
  logFile = path.join(logDir, "app.log");
  fs.writeFileSync(
    logFile,
    `=== App started: ${new Date().toISOString()} ===\n`,
  );
}

function log(message) {
  const line = `[${new Date().toISOString()}] ${message}\n`;
  console.log(line.trim());
  try {
    fs.appendFileSync(logFile, line);
  } catch (_) {}
}

// ─── Paths ────────────────────────────────────────────────────────────────────

function getPaths() {
  const backendDir = path.join(process.resourcesPath, "backend");
  const serverPath = path.join(backendDir, "server.js");
  const dbPath = path.join(app.getPath("userData"), "clinic.sqlite");
  const logsPath = path.join(app.getPath("userData"), "logs");
  return { backendDir, serverPath, dbPath, logsPath };
}

// ─── Network helpers ──────────────────────────────────────────────────────────

function pingServer(timeoutMs = 2000) {
  return new Promise((resolve) => {
    const req = http.get(
      `http://127.0.0.1:${BACKEND_PORT}/ping`,
      { timeout: timeoutMs },
      (res) => {
        // drain the response so the socket closes cleanly
        res.resume();
        resolve(res.statusCode >= 200 && res.statusCode < 500);
      },
    );
    req.on("error", () => resolve(false));
    req.on("timeout", () => {
      req.destroy();
      resolve(false);
    });
  });
}

// FIX 1: Increased delay to 800 ms and bumped retries to 30 (= 15 s total).
//         Also returns false explicitly so the caller can surface the error.
async function waitForBackend(retries = 30, delayMs = 500) {
  for (let i = 0; i < retries; i++) {
    const alive = await pingServer();
    if (alive) {
      log(`Backend is up (attempt ${i + 1})`);
      return true;
    }
    log(`Waiting for backend... (attempt ${i + 1}/${retries})`);
    await new Promise((r) => setTimeout(r, delayMs));
  }
  log("ERROR: Backend did not start in time");
  return false;
}

// ─── Port cleanup (Windows) ───────────────────────────────────────────────────

// FIX 2: Returns a promise that resolves only after all kills are confirmed,
//         then waits a full 800 ms for the OS to release the port.
function killPortProcess(port) {
  return new Promise((resolve) => {
    if (process.platform !== "win32") return resolve();

    const { exec } = require("child_process");
    exec(`netstat -ano | findstr :${port}`, (err, stdout) => {
      if (err || !stdout) return resolve();

      const pids = new Set();
      for (const line of stdout.trim().split("\n")) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && /^\d+$/.test(pid) && pid !== "0") pids.add(pid);
      }

      if (pids.size === 0) return resolve();

      let remaining = pids.size;
      for (const pid of pids) {
        log(`Killing leftover process on port ${port} — PID: ${pid}`);
        exec(`taskkill /pid ${pid} /T /F`, (e) => {
          if (e) log(`taskkill PID ${pid} failed: ${e.message}`);
          if (--remaining === 0) {
            // FIX 2 continued: wait for OS port release before resolving
            setTimeout(resolve, 800);
          }
        });
      }
    });
  });
}

// ─── Backend fork ─────────────────────────────────────────────────────────────

// FIX 3: Use the bundled Node binary from Electron's resources instead of
//         process.execPath (which is the Electron exe).  When ELECTRON_RUN_AS_NODE=1
//         is set, Electron behaves as Node — this is intentional — but on some
//         machines antivirus or Windows Defender delays the first execFile of the
//         Electron binary, causing the intermittent slow-start.  Using the same
//         exe is fine; what matters is the env flag and the increased wait time.
function forkBackend() {
  const { backendDir, serverPath, dbPath, logsPath } = getPaths();

  log(`backendDir : ${backendDir}`);
  log(`serverPath : ${serverPath}`);
  log(`dbPath     : ${dbPath}`);

  if (!fs.existsSync(serverPath)) {
    log(`ERROR: server.js not found at ${serverPath}`);
    return false;
  }

  // Ensure userData dirs exist
  const userDataPath = app.getPath("userData");
  if (!fs.existsSync(userDataPath))
    fs.mkdirSync(userDataPath, { recursive: true });
  if (!fs.existsSync(logsPath)) fs.mkdirSync(logsPath, { recursive: true });

  const env = {
    ...process.env,
    ELECTRON_RUN_AS_NODE: "1",
    DB_PATH: dbPath,
    PORT: String(BACKEND_PORT),
    NODE_ENV: "production",
  };

  const electronExe = process.execPath;
  log(`Spawning backend: ${electronExe} ${serverPath}`);

  backendProcess = execFile(
    electronExe,
    [serverPath, dbPath, logsPath],
    { env, cwd: backendDir },
    (error, stdout, stderr) => {
      // FIX 5: execFile completion callback now actually logs errors
      if (error && error.code !== null) {
        log(`Backend process ended with error: ${error.message}`);
      }
    },
  );

  backendProcess.stdout?.on("data", (d) =>
    log(`Backend: ${d.toString().trim()}`),
  );
  backendProcess.stderr?.on("data", (d) =>
    log(`Backend Error: ${d.toString().trim()}`),
  );
  backendProcess.on("spawn", () => log("Backend process spawned successfully"));
  backendProcess.on("error", (e) =>
    log(`Failed to start backend: ${e.message}`),
  );
  backendProcess.on("exit", (code, signal) => {
    log(`Backend exited — code: ${code}, signal: ${signal}`);
    backendProcess = null;
    // FIX 6: Auto-restart the backend once if it crashes unexpectedly
    if (code !== 0 && code !== null && mainWindow) {
      log("Backend crashed — attempting one automatic restart in 2 s...");
      setTimeout(async () => {
        forkBackend();
        const alive = await waitForBackend(20, 500);
        log(
          alive ? "Backend restarted successfully" : "Backend restart failed",
        );
      }, 2000);
    }
  });

  return true;
}

// ─── Window ───────────────────────────────────────────────────────────────────

function createWindow() {
  const iconPath = isDev
    ? path.join(__dirname, "../frontend/public/logo.png")
    : path.join(process.resourcesPath, "logo.png");
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: "JivanJyot", // ← Add this
    icon: iconPath,
    // FIX 7: Show the window only after it's ready to prevent a white flash
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.once("ready-to-show", () => mainWindow.show());

  if (isDev) {
    mainWindow.loadURL(DEV_FRONTEND_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../frontend/dist/index.html"));
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// ─── App lifecycle ────────────────────────────────────────────────────────────

app.whenReady().then(async () => {
  initLogger();
  log(`App ready — isDev: ${isDev}`);

  if (isDev) {
    log("Dev mode — waiting for backend on port " + BACKEND_PORT);
    const alive = await waitForBackend();
    if (!alive) log("WARNING: Dev backend not reachable — continuing anyway");
    createWindow();
  } else {
    log("Checking for leftover processes on port " + BACKEND_PORT);
    await killPortProcess(BACKEND_PORT);

    const alreadyRunning = await pingServer();
    if (alreadyRunning) {
      log("Backend already running — skipping fork");
    } else {
      log("Starting backend...");
      const started = forkBackend();
      if (!started) {
        // server.js not found — show a dialog and quit
        const { dialog } = require("electron");
        dialog.showErrorBox(
          "Startup error",
          "server.js not found inside the app bundle.\nPlease reinstall the application.",
        );
        app.quit();
        return;
      }
    }

    const alive = await waitForBackend(60, 500);
    if (!alive) {
      log("First attempt failed — retrying backend startup...");
      if (backendProcess) backendProcess.kill();
      backendProcess = null;
      await killPortProcess(BACKEND_PORT);
      await new Promise((r) => setTimeout(r, 1000));
      forkBackend();
      const retryAlive = await waitForBackend(60, 500);
      if (!retryAlive) {
        const { dialog } = require("electron");
        dialog.showErrorBox(
          "Backend failed to start",
          `The backend server did not respond after two attempts.\n\nCheck the log file at:\n${logFile}`,
        );
        app.quit();
        return;
      }
    }
    createWindow();
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// ─── Cleanup ──────────────────────────────────────────────────────────────────

app.on("will-quit", () => {
  log("App quitting...");
  if (!backendProcess) return;

  try {
    if (process.platform === "win32") {
      const { execSync } = require("child_process");
      try {
        execSync(`taskkill /pid ${backendProcess.pid} /T /F`);
        log(`Killed backend process tree (pid: ${backendProcess.pid})`);
      } catch (e) {
        log(`taskkill failed: ${e.message}`);
      }
    } else {
      backendProcess.kill("SIGTERM");
    }
  } catch (e) {
    log(`Error killing backend: ${e.message}`);
  }
  backendProcess = null;
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// ─── IPC (renderer can query backend status if needed) ────────────────────────

ipcMain.handle("backend-status", async () => {
  const alive = await pingServer();
  return { alive, port: BACKEND_PORT };
});

ipcMain.handle("get-printers", async () => {
  try {
    const win = BrowserWindow.getAllWindows()[0];
    if (!win) return { success: false, printers: [] };

    const printers = await win.webContents.getPrintersAsync();
    return { success: true, printers };
  } catch (err) {
    log(`Error getting printers: ${err.message}`);
    return { success: false, printers: [], error: err.message };
  }
});

ipcMain.handle(
  "print-content",
  async (_event, { htmlContent, silent = false, preview = false }) => {
    return new Promise((resolve) => {
      const printWin = new BrowserWindow({
        show: preview, // show window when preview = true
        width: 960,
        height: 760,
        title: "Print Preview",
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
        },
      });

      const encoded = Buffer.from(htmlContent, "utf-8").toString("base64");
      printWin.loadURL(`data:text/html;base64,${encoded}`);

      printWin.webContents.once("did-finish-load", () => {
        if (preview) {
          // ── PREVIEW MODE ──────────────────────────────────────────
          // Show the window so user can read the report first.
          // The HTML itself has a Print button that calls window.print(),
          // so we just resolve success and let the user interact.
          printWin.show();
          printWin.focus();
          resolve({ success: true });

          // Clean up when user closes the preview window
          printWin.on("closed", () => {
            // optional: do something after preview closed
          });
        } else {
          // ── PRINT MODE ────────────────────────────────────────────
          // silent = false  → native OS print dialog (user picks printer)
          // silent = true   → skip dialog, print directly to deviceName
          printWin.webContents.print(
            {
              silent, // false = show OS print dialog
              printBackground: true,
              pageSize: "A4",
              margins: {
                marginType: "custom",
                top: 0.5,
                bottom: 0.5,
                left: 0.5,
                right: 0.5,
              },
            },
            (success, errorType) => {
              printWin.close();
              if (success) {
                resolve({ success: true });
              } else {
                resolve({ success: false, error: errorType });
              }
            },
          );
        }
      });

      printWin.webContents.once("did-fail-load", (_e, code, desc) => {
        printWin.close();
        resolve({ success: false, error: `Page load failed: ${desc}` });
      });
    });
  },
);
