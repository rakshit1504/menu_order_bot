import express from "express";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());

const {
  WEBHOOK_VERIFY_TOKEN,
  GRAPH_API_TOKEN,
  PHONE_NUMBER_ID,
  PORT = 3000,
  CATALOG_TEMPLATE_NAME,
} = process.env;
const API_BASE_URL = "https://graph.facebook.com/v18.0";

//Send catalog template (used when user types "menu")
async function sendCatalogTemplate(to) {
  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: CATALOG_TEMPLATE_NAME,
      language: { code: "en" },
      components: [
        {
          type: "button",
          sub_type: "catalog",
          index: 0
        }
      ]
    }
  };
  try {
    const res = await axios.post(`${API_BASE_URL}/${PHONE_NUMBER_ID}/messages`, payload, {
      headers: {
        Authorization: `Bearer ${GRAPH_API_TOKEN}`,
        "Content-Type": "application/json"
      }
    });   

    console.log(`Sent catalog template "${CATALOG_TEMPLATE_NAME}" to ${to}`);
  } catch (error) {
    const { response } = error;
    console.error("❌ Failed to send catalog template:");    
    console.error(`Status: ${response?.status}`);
    console.error(`Message: ${response?.data?.error?.message}`);
    console.error(`Type: ${response?.data?.error?.type}`);
    console.error("Details:", JSON.stringify(response?.data, null, 2));
  }
}

// Send fallback text
async function sendText(to, text) {
  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: { body: text }
  };

  try {
    await axios.post(`${API_BASE_URL}/${PHONE_NUMBER_ID}/messages`, payload, {
      headers: {
        Authorization: `Bearer ${GRAPH_API_TOKEN}`,
        "Content-Type": "application/json"
      }
    });
    
    console.log(`Sent text to ${to}: "${text}"`);
  } catch (error) {
    console.error("❌ Failed to send text message:");
    console.error("Status:", error.response?.status);
    console.error("Message:", error.response?.data?.error?.message);
    console.error("Details:", JSON.stringify(error.response?.data, null, 2));
  }
}

// Webhook verification (Meta setup step)
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  if (mode === "subscribe" && token === WEBHOOK_VERIFY_TOKEN) {
    console.log("✅ Webhook verified");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Main message handler
app.post("/webhook", async (req, res) => {
  const body = req.body;
  if (body.object === "whatsapp_business_account") {
    for (const entry of body.entry) {
      for (const change of entry.changes) {
        const messages = change.value?.messages || [];
        for (const msg of messages) {
          const from = msg.from;

          // Handle Order Messages
          if (msg.type === "order") {
            const order = msg.order;
            const items = order.product_items;

            console.log("Received an order from:", from);
            console.log("Cart contents:", JSON.stringify(order, null, 2));

            let total = 0;
            let summary = "Order summary:\n";
            for (const item of items) {
              const { product_retailer_id, quantity, item_price, currency } = item;
              summary += `- ${product_retailer_id} x${quantity} = ${item_price * quantity} ${currency}\n`;
              total += item_price * quantity;
            }
            summary += `\nTotal: ${total} ${items[0]?.currency || 'INR'}`;

            await sendText(from, `✅ Order received!\n${summary}\n\nThanks for shopping with us. We'll process it soon.`);
            continue;
          }
          // Handle Text Messages
          const msgText = msg.text?.body?.toLowerCase();
          console.log(`Received message from ${from}: "${msgText}"`);

          if (msgText === "menu") {
            await sendCatalogTemplate(from);
          } else {
            await sendText(from, `Send *menu* to see today’s dishes`);
          }
        }
      }
    }
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

