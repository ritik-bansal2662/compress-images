const { Sequelize } = require("sequelize");

const dbHost = process.env.DB_HOST
const dbPort = process.env.DB_PORT
const dbName = process.env.DB_NAME
const dbUser = process.env.DB_USER
const dbPassword = process.env.DB_PASSWORD

console.log("db credentials: ", dbHost, dbPort, dbName, dbUser, dbPassword);


const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: "mysql",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // Required for some cloud-hosted DBs
    },
  },
  logging: false,
  pool: {
    max: 5, // Check if this is causing the issue
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

sequelize.authenticate()
  .then(() => console.log("Database connected"))
  .catch((err) => console.error("Database connection failed:", err));

module.exports = { sequelize };