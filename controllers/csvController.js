const fs = require("fs");
const csv = require("csv-parser");
const axios = require("axios");
const sharp = require("sharp");
const path = require("path");
const CsvRecord = require("../models/CsvRecord");
const ReqMaster = require("../models/RequestMaster");
const { processImages } = require("../utils/processImages");
const { Readable } = require("stream");

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

exports.uploadCSV = async (req, res) => {
  console.log('req file: ', req.file)
  if (!req.file) return res.status(400).json({ request: req,  error: "No file uploaded" });
  const reqId = await getRequestId();
  console.log('reqId: ', reqId);
  
  // const uploadDir = path.join(__dirname, "../tmp/uploads");
  // if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);


  const results = [];
  let isFirstRow = true;
  const stream = Readable.from(req.file.buffer.toString());

  stream
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
        // for (const record of results) {
        //   const imageUrls = record.images.replaceAll(/\s/g, "").split(",").map((url) => url.trim());
        //   const storedUrls = [];

        //   for (const url of imageUrls) {
        //     let storedUrl = (await downloadAndCompressImage(reqId, url, uploadDir));
        //     if (storedUrl) storedUrls.push(process.env.SERVICE_URL + storedUrl);
        //     else {
        //       throw new Error(`Invalid image Url. ${url}. Found in Sno: ${record.sno}`);
        //     }
        //   }

        //   record.compressedImages = storedUrls.join(",");
        // }

        // console.log(results);
        
        await CsvRecord.bulkCreate(results);

        // Process images asynchronously
        processImages(reqId);

        res.json({ requestId: reqId,  message: "Request generated. Images are being processed." });
      } catch (err) {
        console.log(err);
        
        res.status(500).json({requestId: reqId, error: err.message });
      }
      // fs.unlinkSync(req.file.path);
    });
};
