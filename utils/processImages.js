const axios = require("axios");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const CsvRecord = require("../models/CsvRecord");

const downloadAndCompressImage = async (imageUrl, outputFolder) => {
  try {
    const response = await axios({ url: imageUrl, responseType: "arraybuffer" });
    const imageBuffer = Buffer.from(response.data);
    const imageName = path.basename(imageUrl).split("?")[0]; // Remove query params
    const outputFilePath = path.join(outputFolder, imageName);

    await sharp(imageBuffer).resize({ width: Math.round(0.5 * 800) }).toFile(outputFilePath);

    return `/uploads/${imageName}`;
  } catch (error) {
    console.error("Error processing image:", imageUrl);
    return null;
  }
};

const triggerWebhook = async (requestId, correctImgCount, falseImgCnt) => {
    try {
        const webhookUrl = process.env.SERVICE_URL + "/webhook"

      await axios.post(webhookUrl, {
        requestId,
        status: "completed",
        message: `${correctImgCount} images have been processed successfully.`,
        correctImages : correctImgCount, 
        falseImages : falseImgCnt
      });
      console.log(`Webhook triggered for requestId: ${requestId}`);
    } catch (error) {
      console.error("Failed to trigger webhook:", error.message);
    }
};

exports.processImages = async (reqId) => {
  try {
    const records = await CsvRecord.findAll({ where: { reqId } });

    if (records.length === 0) return;

    let correctImgCount = 0;
    let falseImgCnt = 0;

    const uploadDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

    for (const record of records) {
      const imageUrls = record.images.split(",").map((url) => url.trim());
      const storedUrls = [];

      for (const url of imageUrls) {
        const storedUrl = await downloadAndCompressImage(url, uploadDir);
        if (storedUrl) {
            correctImgCount++;
            storedUrls.push(process.env.SERVICE_URL + storedUrl);
        } else {
            falseImgCnt++;
        }
      }

      // Update record with processed image URLs
      await record.update({ compressedImages: storedUrls.join(",") });
    }

    // Trigger our own webhook after processing all images
    await triggerWebhook(reqId, correctImgCount, falseImgCnt);

    console.log(`Images processed for reqId: ${reqId}`);
  } catch (error) {
    console.error("Error processing images:", error);
  }
};
