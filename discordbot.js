// Discord Bot
require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { parseInput } = require('./replies.js');

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

// 如果接收到新訊息
discordClient.on('messageCreate', async msg => {
    if (msg.author.bot) return;

    let reply = parseInput(null, msg.content);

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