const Database = require("better-sqlite3");
const { app } = require("electron");
const path = require("path");

const dbPath = path.join(app.getPath("userData"), "clinic.db");
console.log('dbPath',dbPath)
const db = new Database(dbPath);

// ── Main patients table ──────────────────────────────────────────────────────
db.prepare(`
  CREATE TABLE IF NOT EXISTS patients (
    id                   INTEGER PRIMARY KEY AUTOINCREMENT,
    case_no              INTEGER,
    date                 TEXT,
    patient_name         TEXT,
    company_name         TEXT,
    address              TEXT,
    sex                  TEXT,
    age                  INTEGER,
    age_unit             TEXT DEFAULT 'Year',
    provisional_diagnosis TEXT,
    rx_given             TEXT,

    -- Billing items: Da (days/qty) × Price = Total per item
    medicines_da         REAL DEFAULT 0,
    medicines_price      REAL DEFAULT 0,
    dressing_da          REAL DEFAULT 0,
    dressing_price       REAL DEFAULT 0,
    injection_da         REAL DEFAULT 0,
    injection_price      REAL DEFAULT 0,
    tablet_da            REAL DEFAULT 0,
    tablet_price         REAL DEFAULT 0,
    capsules_da          REAL DEFAULT 0,
    capsules_price       REAL DEFAULT 0,
    iv_da                REAL DEFAULT 0,
    iv_price             REAL DEFAULT 0,
    others_da            REAL DEFAULT 0,
    others_price         REAL DEFAULT 0,

    -- Bill summary
    total                REAL DEFAULT 0,
    paid                 REAL DEFAULT 0,
    remain               REAL DEFAULT 0,

    followup_date        TEXT,
    created_at           TEXT DEFAULT (datetime('now'))
  )
`).run();

// ── Migrate: add new columns to existing DB safely ───────────────────────────
const existingCols = db.prepare("PRAGMA table_info(patients)").all().map(c => c.name);

const newCols = [
  ["age_unit",        "TEXT DEFAULT 'Year'"],
  ["medicines_da",    "REAL DEFAULT 0"],
  ["medicines_price", "REAL DEFAULT 0"],
  ["dressing_da",     "REAL DEFAULT 0"],
  ["dressing_price",  "REAL DEFAULT 0"],
  ["injection_da",    "REAL DEFAULT 0"],
  ["injection_price", "REAL DEFAULT 0"],
  ["tablet_da",       "REAL DEFAULT 0"],
  ["tablet_price",    "REAL DEFAULT 0"],
  ["capsules_da",     "REAL DEFAULT 0"],
  ["capsules_price",  "REAL DEFAULT 0"],
  ["iv_da",           "REAL DEFAULT 0"],
  ["iv_price",        "REAL DEFAULT 0"],
  ["others_da",       "REAL DEFAULT 0"],
  ["others_price",    "REAL DEFAULT 0"],
  ["created_at",      "TEXT DEFAULT (datetime('now'))"],
];

for (const [col, def] of newCols) {
  if (!existingCols.includes(col)) {
    db.prepare(`ALTER TABLE patients ADD COLUMN ${col} ${def}`).run();
  }
}

module.exports = db;