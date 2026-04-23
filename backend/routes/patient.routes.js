import express from "express";
import { addPatient, deletePatientData, getPatientData, updatePatient } from "../controllers/addpatients.js";
import {
  createCompany,
  deleteCompany,
  getAllCompanies,
} from "../controllers/companycontrollers.js";
const router = express.Router();

router.post("/addPatient", addPatient);
router.put(`/updatePatient/:id`,updatePatient);
router.delete(`/delete/:id`,deletePatientData);
router.post("/createCompany", createCompany);
router.get("/companies", getAllCompanies);
router.get('/getPatient',getPatientData);
router.delete('/deleteCompany/:id',deleteCompany);

export default router;
