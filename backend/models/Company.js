import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Company = sequelize.define(
  "Company",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    authorizedPersonName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    address: {
      type: DataTypes.TEXT,
    },

    contact: {
      type: DataTypes.STRING,
    },
  },
  { timestamps: true },
);

export default Company;
