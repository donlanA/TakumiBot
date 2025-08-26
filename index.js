require('dotenv').config();
const express = require("express");

const app = express();

// 掛上 Discord bot（自己啟動，不依賴 express）
require('./discordbot.js');

// 掛上 LINE bot router
const lineRouter = require('./linebot.js');
app.use('/line', lineRouter);

// Render 會提供 PORT 環境變數
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
