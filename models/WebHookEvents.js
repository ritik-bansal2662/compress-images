const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const WebhookEvent = sequelize.define("WebhookEvent", {
  requestId: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.STRING, allowNull: false },
  correctImages: {type: DataTypes.INTEGER, allowNull: false},
  falseImages: {type: DataTypes.INTEGER, allowNull: false},
  message: { type: DataTypes.TEXT },
});

module.exports = WebhookEvent;
