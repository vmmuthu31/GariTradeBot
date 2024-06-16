const TelegramBot = require("node-fetch");
const { swapTokens } = require("./aptosClient");
const { authenticateWithOkto, connectWallet } = require("./oktoWallet");

const bot = new TelegramBot("7311967959:AAHl0emr4JiZYH5gGbMChlVLuVepPP67Tds", {
  polling: true,
});

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "Welcome to GariTradeBot! Use /connect to connect your wallet."
  );
});

bot.onText(/\/connect/, async (msg) => {
  try {
    const account = await authenticateWithOkto();
    bot.sendMessage(msg.chat.id, `Wallet connected: ${account.address}`);
  } catch (error) {
    bot.sendMessage(msg.chat.id, `Error connecting wallet: ${error.message}`);
  }
});

bot.onText(/\/swap (.+)/, async (msg, match) => {
  const params = match[1].split(" ");
  const fromToken = params[0];
  const toToken = params[1];
  const amount = parseFloat(params[2]);

  try {
    const account = await connectWallet();
    const result = await swapTokens(fromToken, toToken, amount, account);
    bot.sendMessage(msg.chat.id, `Swap successful: ${JSON.stringify(result)}`);
  } catch (error) {
    bot.sendMessage(msg.chat.id, `Error during swap: ${error.message}`);
  }
});

bot.onText(/\/echo (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const resp = match[1];
  bot.sendMessage(chatId, resp);
});

console.log("Bot is running...");
