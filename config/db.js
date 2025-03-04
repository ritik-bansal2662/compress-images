const { Sequelize } = require("sequelize");
const fs = require("fs");

const dbHost = process.env.DB_HOST
const dbPort = process.env.DB_PORT
const dbName = process.env.DB_NAME
const dbUser = process.env.DB_USER
const dbPassword = process.env.DB_PASSWORD

console.log("db credentials: ", dbHost, dbPort, dbName, dbUser, dbPassword);


// const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
//   host: dbHost,
//   port: dbPort,
//   dialect: "mysql",
//   logging: false,
// });

const sequelize = new Sequelize({
  host: dbHost,
  port: dbPort,
  database: dbName, 
  username: dbUser, 
  password: dbPassword,
  dialect: "mysql",
  logging: false,
  dialectModule: require('mysql2'),
  dialectOptions: {
    ssl: {
      rejectUnauthorized: true, // Ensures SSL verification
      ca: process.env.DB_SSL_CA ? fs.readFileSync(process.env.DB_SSL_CA) : undefined,
    },
  },
});

sequelize.authenticate()
  .then(() => console.log("Database connected"))
  .catch((err) => console.error("Database connection failed:", err));

module.exports = { sequelize };