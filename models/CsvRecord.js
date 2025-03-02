const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const CsvRecord = sequelize.define("CsvRecord", {
  sno: { type: DataTypes.INTEGER, allowNull: false },
  reqId : { type: DataTypes.STRING, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  images: { type: DataTypes.TEXT, allowNull: false },
  compressedImages: { type: DataTypes.TEXT, allowNull: false },
});

module.exports = CsvRecord;