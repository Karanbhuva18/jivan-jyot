const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  addPatient: (data) => ipcRenderer.invoke("add-patient", data),
  getPatients: () => ipcRenderer.invoke("get-patients"),
  setup: () => ipcRenderer.invoke("setup"),
  getPrinters: () => ipcRenderer.invoke("get-printers"),

  printContent: (opts) => ipcRenderer.invoke("print-content", opts),
});
