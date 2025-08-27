require('dotenv').config();
const express = require("express");

const app = express();

// Discord bot
require('./discordbot.js');

// LINE bot 的 router
// webhook 設為 https://xxx.onrender.com/line
const lineRouter = require('./linebot.js');
app.use('/line', lineRouter);

// Discord bot 使用根目錄 https://xxx.onrender.com/
app.get('/', (req, res) => {
  console.log("uptimeRobot enter");
  res.send("DiscordBot");
});

app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

// Render會用到的port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
