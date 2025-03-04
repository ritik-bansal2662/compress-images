require('dotenv').config()

process.env.TZ = "Asia/Kolkata";

const express = require("express");
const multer = require("multer");
const path = require("path");
const csvController = require("./controllers/csvController");
const csvStatusController = require("./controllers/csvStatusController");
const webhookController = require("./controllers/webhookController");
const { sequelize } = require("./config/db");
// const fileUpload = require("express-fileupload")

// console.log('env: ', process.env)

const app = express();
const port = 3000;

app.use(express.json());
// Sync database
sequelize.sync().then(() => console.log("Database synced"));


// app.use(fileUpload({
//   useTempFiles: true
// }))

// Serve static files from the 'uploads' directory
app.use("/uploads", express.static(path.join(__dirname, "/tmp/uploads")));

// Configure Multer for file upload
const upload = multer({ dest: "uploads/" });

app.get("/", (req, res) => res.json({
  "status":"ok",
  "message": "App is working.",
  "endpoints" : ["POST /upload", "GET /status"]
}));

// API to upload CSV file
app.post("/upload", upload.single("file"), csvController.uploadCSV);

// API to download CSV status based on request ID
app.get("/status", csvStatusController.getCSVStatus);


// Webhook endpoint
app.post("/webhook", webhookController.handleWebhook);


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});