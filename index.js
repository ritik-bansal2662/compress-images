require('dotenv').config()

process.env.TZ = "Asia/Kolkata";

const express = require("express");
const cors = require('cors');
const multer = require("multer");
const path = require("path");
const csvController = require("./controllers/csvController");
const csvStatusController = require("./controllers/csvStatusController");
const webhookController = require("./controllers/webhookController");
const { sequelize } = require("./config/db");
// const fileUpload = require("express-fileupload")

// console.log('env: ', process.env)

const app = express();


// Configure Multer for file upload
// const upload = multer({ dest: "/tmp/" });

const storage = multer.memoryStorage(); // Store in memory (required for Vercel)
const upload = multer({ storage });


app.use(cors());
app.use(
  cors({
    origin: "*", // Allow all origins (IPs)
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], // Allow all methods
    allowedHeaders: ["*"], // Allow all headers
  })
);
// Sync database
sequelize.sync().then(() => console.log("Database synced"));
const port = 3000;


// app.use(fileUpload({
//   useTempFiles: true
// }))

// Serve static files from the 'uploads' directory
// app.use("/uploads", express.static(path.join(__dirname, "/tmp/uploads")));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => res.json({
  "status":"ok",
  "message": "App is working.",
  "endpoints" : ["POST /upload", "GET /status"]
}));

// API to upload CSV file
app.post(
    "/upload", 
    (req, res, next) => {
        console.log("Request Headers:", req.headers);
        console.log("Request Body:", req.body);
        next();
    }, 
    upload.single("file"), 
    csvController.uploadCSV
);

// API to download CSV status based on request ID
app.get("/status", csvStatusController.getCSVStatus);


// Webhook endpoint
app.post("/webhook", webhookController.handleWebhook);


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});