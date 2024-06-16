const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const port = 3000;

app.use(cors());

const TELEGRAM_API_URL = "https://api.telegram.org/bot<token>";

app.use(bodyParser.json());

app.post("/webhook", (req, res) => {
  const message = req.body.message;
  if (message && message.text) {
    handleTelegramMessage(message);
  }
  res.sendStatus(200);
});

const handleTelegramMessage = async (message) => {
  const chatId = message.chat.id;
  const text = message.text;
  let responseText;

  if (text === "/start") {
    responseText = "Welcome to the TeleTradeBot!";
  } else {
    responseText = `You said: ${text}`;
  }

  await sendMessage(chatId, responseText);
};

const sendMessage = async (chatId, text) => {
  try {
    await axios.post(`${TELEGRAM_API_URL}/sendMessage`, {
      chat_id: chatId,
      text: text,
    });
  } catch (error) {
    console.error("Error sending message:", error);
  }
};

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
