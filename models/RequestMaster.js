const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const ReqMaster = sequelize.define("request_master", {
  reqId : { type: DataTypes.STRING, allowNull: false },
});

module.exports = ReqMaster;