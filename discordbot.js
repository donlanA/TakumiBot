// Discord Bot
require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { parseInput } = require('./replies.js');
const express = require("express");

const discordClient = new Client({
    intents:
        [
            // 基本事件
            GatewayIntentBits.Guilds, 

            // 排程事件
            GatewayIntentBits.GuildScheduledEvents, 

            // 聊天室如果有動作的事件
            GatewayIntentBits.GuildMessages, 

            // 接收聊天室內容的事件 → 需要到 Discord Developer Portal 把 MESSAGE CONTENT INTENT 打開
            GatewayIntentBits.MessageContent, 

            // 接收到反應的事件
            GatewayIntentBits.GuildMessageReactions 
        ]
});

discordClient.on('ready', () => {
    // 設定我們的機器人狀態
    // activities 的 name 是狀態的名稱
    // status 是表示在線上或者忙碌中 目前是 online 也就是常常看到的綠燈
    discordClient.user.setPresence({ activities: [{ name: '百日戰記 -最終防衛學園-' }], status: 'online' });
});

//有表情的伺服器id
const guild_id = "1407608060113059932"; 

// 如果接收到新訊息
discordClient.on('messageCreate', async msg => {
    if (msg.author.bot) return;

    let guildFlag = msg.guild?.id === guild_id;
    let reply = parseInput(null, msg.content, guildFlag);
    
    if (reply !== undefined && reply !== null) {
        if (Array.isArray(reply)) {
            let textMsg = reply.find(m => m.type === "text");
            if (textMsg) msg.reply(textMsg.text);
        } else if (typeof reply === 'string' && reply.length > 0) {
            msg.reply(reply);
        }
    }
});


// Discord Developer Portal 上 Bot 的 Token
discordClient.login(process.env.DISCORD_TOKEN).catch(err => {
    console.error('Discord 登入失敗:', err);
});

// 使用環境變數或預設port 3000
const PORT = process.env.PORT || 3000; 

// 引用 express
const app = express();

// 首頁入口顯示 DiscordBot
app.get('/', (req, res) => {
    // 系統記錄用的訊息
    // 之後用 UptimeRobot 用的
	console.log("uptimeRobot enter");
	res.send("DiscordBot");
});

// 網頁的健康檢查 Render 內設定時使用的
app.get('/healthz', (req, res) => {
	res.status(200).send('OK');
});

// 啟用網站
app.listen(PORT, () => {
    // 系統訊息來看是不是真的執行了
	console.log("start Server");

    // 定時 1 分鐘檢查佔用的記憶體
    // 因為 Render 有限制 512 MB 需要定時清理不需要的記憶體
	setInterval(() => {
        // 取得記憶體的使用容量
		let mUsage = process.memoryUsage();
		// 加總記憶體容量
        let memorySum = mUsage.rss + mUsage.heapUsed + mUsage.heapTotal + mUsage.external + mUsage.arrayBuffers;
        // 換算成 MB
		let memoryMB = (memorySum/(1024*1024)).toFixed(2) + " MB";

        // 顯示日期以及佔用的記憶體
		console.log(`Live...${memoryMB} ` + new Date());
        
        // 回收記憶體
		gc();
	}, 60000);
});