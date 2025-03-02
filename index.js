require('dotenv').config()
const express = require("express");
const multer = require("multer");
const path = require("path");
const csvController = require("./controllers/csvController");
const csvStatusController = require("./controllers/csvStatusController");
const { sequelize } = require("./config/db");

// console.log('env: ', process.env)

const app = express();
const port = 3000;

// Sync database
sequelize.sync().then(() => console.log("Database synced"));

// Serve static files from the 'uploads' directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Configure Multer for file upload
const upload = multer({ dest: "uploads/" });

// API to upload CSV file
app.post("/upload", upload.single("file"), csvController.uploadCSV);

// API to download CSV status based on request ID
app.get("/status", csvStatusController.getCSVStatus);


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});