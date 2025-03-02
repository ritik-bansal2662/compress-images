const { Sequelize } = require("sequelize");

const dbHost = process.env.DB_HOST
const dbName = process.env.DB_NAME
const dbUser = process.env.DB_USER
const dbPassword = process.env.DB_PASSWORD

console.log("db credentials: ", dbHost, dbName, dbUser, dbPassword);


const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  dialect: "mysql",
  logging: false,
});

sequelize.authenticate()
  .then(() => console.log("Database connected"))
  .catch((err) => console.error("Database connection failed:", err));

module.exports = { sequelize };