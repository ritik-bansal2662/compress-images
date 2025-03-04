const CsvRecord = require("../models/CsvRecord");
const { Parser } = require("json2csv");
const path = require("path");
const fs = require("fs");

exports.getCSVStatus = async (req, res) => {
  const { requestId } = req.query;
  if (!requestId) return res.status(400).json({ error: "Request ID is required" });

  try {
    const records = await CsvRecord.findAll({ where: { reqId : requestId } });
    if (records.length === 0) return res.status(404).json({ error: "No records found for this request ID" });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=${requestId}_status.csv`);
    res.write("sno,Name,Input Images Urls, Compressed Images URLs \n");
    records.forEach((record) => res.write(`${record.sno},${record.name},"${record.images}","${record.compressedImages}"\n`));
    res.end();

    // const json2csvParser = new Parser({ fields: [
    //         { label: "Serial Number", value: "sno" },
    //         { label: "Request Id", value: "reqId" },
    //         { label: "Product Name", value: "name" },
    //         { label: "Input Image URLs", value: "images" },
    //         { label: "Output Image URLs", value: "compressedImages" },
    //     ] 
    // });
    // const csvData = json2csvParser.parse(records);

    // const filePath = path.join(__dirname, "../tmp/uploads/status_" + requestId + ".csv");
    // fs.writeFileSync(filePath, csvData);
    
    // const fileName = `${requestId}_status.csv`;

    // res.download(filePath, fileName, () => fs.unlinkSync(filePath));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};