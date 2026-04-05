import { Sequelize } from "sequelize";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// DB_PATH passed by Electron via fork env — no env file needed
const dbPath = process.env.DB_PATH || path.join(__dirname, "../clinic.sqlite");

const dbFolder = path.dirname(dbPath);
if (!fs.existsSync(dbFolder)) {
  fs.mkdirSync(dbFolder, { recursive: true });
}

console.log("DB storage path:", dbPath);

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: dbPath,
  logging: false,
  pool: {
    max: 5,
    min: 0,
    idle: 10000,
  },
});

export default sequelize;
