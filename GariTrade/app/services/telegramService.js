import axios from "axios";

export const sendTelegramMessage = async (chatId, message) => {
  const TELEGRAM_API_URL = `https://api.telegram.org/bot<YOUR_BOT_API_KEY>/sendMessage`;
  const params = {
    chat_id: chatId,
    text: message,
  };

  try {
    const response = await axios.get(TELEGRAM_API_URL, { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response.data.description);
  }
};
