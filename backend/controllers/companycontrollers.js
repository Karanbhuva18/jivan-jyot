import Company from "../models/Company.js";

export const createCompany = async (req, res) => {
  try {
    const { name, authorizedPersonName, address, contact } = req.body;

    if (!name || !authorizedPersonName) {
      return res.status(400).json({
        message: "Company name and authorized person name are required",
      });
    }

    const existingCompany = await Company.findOne({
      where: { name },
    });

    if (existingCompany) {
      return res.status(409).json({
        message: "Company already exists",
      });
    }

    // Create company
    const company = await Company.create({
      name,
      authorizedPersonName,
      address,
      contact,
    });

    res.status(201).json({
      message: "Company created successfully",
      data: company,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.findAll({
      order: [["name", "ASC"]],
    });

    res.status(200).json({
      message: "Companies fetched successfully",
      data: companies,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
