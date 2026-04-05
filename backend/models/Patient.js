import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Patient = sequelize.define(
  "Patient",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    patientName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    companyId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    sex: {
      type: DataTypes.ENUM("Male", "Female"),
      allowNull: false,
    },

    age: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    diagnosis: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    prescription: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    billingItems: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },

    totalAmount: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
  },
);

export default Patient;
