import express from "express";
import cors from "cors";
import Patient from "./models/Patient.js";
import Company from "./models/Company.js";
import sequelize from "./config/database.js";
import patientRouter from "./routes/patient.routes.js";

const app = express();
const PORT = process.env.PORT || 5000;

Company.hasMany(Patient, { foreignKey: "companyId", as: "patients" });
Patient.belongsTo(Company, { foreignKey: "companyId", as: "company" });

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  }),
);

app.use(express.json());
app.use("/api/v1", patientRouter);

// Health check — used by Electron's pingServer()
app.get("/ping", (req, res) => res.json({ status: "ok" }));

const startServer = async () => {
  try {
    // force: false  → never drop tables
    // alter: false  → never modify existing tables
    // Result: creates tables only if they don't exist yet — safe on every restart
    await sequelize.sync({ force: false, alter: false });

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Database error:", error);
    process.exit(1);
  }
};

startServer();
