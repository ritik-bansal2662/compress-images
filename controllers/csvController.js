const fs = require("fs");
const csv = require("csv-parser");
const axios = require("axios");
const sharp = require("sharp");
const path = require("path");
const CsvRecord = require("../models/CsvRecord");
const ReqMaster = require("../models/RequestMaster");

const getRequestId = async () => {
  const id = Date.now();
   await ReqMaster.create({reqId : id});
    console.log('date now: ', id);
    
   return id;
}

const validateCsv = (data) => {
  if(data.length != 3) return false
  return true;
}

const downloadAndCompressImage = async (reqId, imageUrl, outputFolder) => {
  try {
    const response = await axios({
      url: imageUrl,
      responseType: "arraybuffer",
    });
    const imageBuffer = Buffer.from(response.data);
    const imageName = reqId + path.basename(imageUrl).split("?")[0]; // Remove query params
    const outputFilePath = path.join(outputFolder, imageName);
    
    await sharp(imageBuffer)
      .resize({ width: Math.round(0.5 * 800) }) // Resize to 50%
      .toFile(outputFilePath);
    
    return `/uploads/${imageName}`;
  } catch (error) {
    console.error("Error processing image:", imageUrl, error);
    return null;
  }
};

exports.uploadCSV = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  const reqId = await getRequestId();
  console.log('reqId: ', reqId);
  
  const uploadDir = path.join(__dirname, "../uploads");
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

  console.log(req.file)

  const results = [];
  let isFirstRow = true;
  fs.createReadStream(req.file.path)
    .pipe(csv({ headers: true, skipEmptyLines: true }))
    .on("data", (data) => {
      console.log(data);
      const row = Object.values(data);

      if (isFirstRow) {
        // validate the csv
        if(!validateCsv(row)) {
          throw new Error("Invalid CSV file");
        }
        isFirstRow = false;
      } else {
        results.push({
          sno: row[0], // Maps Sno
          reqId : reqId,
          name: row[1], // Maps Name
          images: row[2], // Maps Urls
        });
      }
    })
    .on("end", async () => {
      try {
        for (const record of results) {
          const imageUrls = record.images.replaceAll(/\s/g, "").split(",").map((url) => url.trim());
          const storedUrls = [];

          for (const url of imageUrls) {
            let storedUrl = (await downloadAndCompressImage(reqId, url, uploadDir));
            if (storedUrl) storedUrls.push(process.env.SERVICE_URL + storedUrl);
            else {
              throw new Error(`Invalid image Url. ${url}. Found in Sno: ${record.sno}`);
            }
          }

          record.compressedImages = storedUrls.join(",");
        }

        console.log(results);
        
        await CsvRecord.bulkCreate(results);
        res.json({ requestId: reqId,  message: "File processed successfully and data stored in DB" });
      } catch (err) {
        console.log(err);
        
        res.status(500).json({requestId: reqId, error: err.message });
      }
      fs.unlinkSync(req.file.path);
    });
};
