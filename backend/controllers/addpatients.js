import { Op } from "sequelize";
import Patient from "../models/Patient.js";

export const addPatient = async (req, res) => {
  try {
    const {
      date,
      patientName,
      companyId,
      address,
      sex,
      age,
      billingItems,
      totalAmount,
    } = req.body;
    // required fields validation
    if (!patientName || !companyId || !sex) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    const addPatientData = await Patient.create({
      date,
      patientName,
      companyId,
      address,
      sex,
      age,
      billingItems,
      totalAmount,
    });

    res.status(201).json({
      message: "Patient created successfully",
      data: addPatientData,
    });
  } catch (error) {
    console.log("error.message", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      date,
      patientName,
      companyId,
      address,
      sex,
      age,
      dr,
      billingItems,
      totalAmount,
    } = req.body;

    // required fields validation
    if (!patientName || !companyId || !address || !sex || !age) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    const patient = await Patient.findOne({ where: { id } });

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    await patient.update({
      date,
      patientName,
      companyId,
      address,
      sex,
      age,
      dr,
      billingItems: JSON.stringify(billingItems),
      totalAmount,
    });

    res.status(200).json({
      message: "Patient updated successfully",
      data: patient,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPatientData = async (req, res) => {
  try {
    const { page = 1, limit = 10, companyId, startDate, endDate } = req.query;

    const offset = (page - 1) * limit;

    let whereCondition = {
      isDeleted: false,
    };

    if (companyId) {
      whereCondition.companyId = Number(companyId);
    }

    if (startDate && endDate) {
      whereCondition.date = {
        [Op.between]: [startDate, endDate],
      };
    }

    const { count, rows } = await Patient.findAndCountAll({
      where: whereCondition,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["date", "ASC"]],
    });

    res.status(200).json({
      message: "Patients fetched successfully",
      totalRecords: count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit),
      data: rows,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const deletePatientData = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findOne({
      where: { id, isDeleted: false },
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found or already deleted",
      });
    }

    await patient.update({ isDeleted: true });

    return res.status(200).json({
      success: true,
      message: "Patient deleted successfully (soft delete)",
    });
  } catch (error) {
    console.error("Delete Patient Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
