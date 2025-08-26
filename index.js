require('dotenv').config();
const express = require("express");

const app = express();

// 掛上 Discord bot
require('./discordbot.js');

// 掛上 LINE bot router
const lineRouter = require('./linebot.js');
app.use('/line', lineRouter);

// 根路徑 → 顯示 DiscordBot
app.get('/', (req, res) => {
  console.log("uptimeRobot enter");
  res.send("DiscordBot");
});

// 健康檢查
app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

// Render 會提供 PORT 環境變數
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
