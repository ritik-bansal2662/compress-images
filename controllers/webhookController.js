const WebhookEvent = require("../models/WebHookEvents");

exports.handleWebhook = async (req, res) => {
  try {
    console.log('webhook controller: ', req.body);
    
    const { requestId, status, message, correctImages, falseImages } = req.body;

    if (!requestId || !status) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Store webhook event in database
    await WebhookEvent.create({ requestId, status, message, correctImages, falseImages });

    console.log(`Webhook received for requestId: ${requestId}, Status: ${status}`);

    res.json({ success: true, message: "Webhook received successfully" });
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
