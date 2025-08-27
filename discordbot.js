// Discord Bot
require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { parseInput } = require('./replies.js');

const discordClient = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildScheduledEvents,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions
    ]
});

discordClient.on('ready', () => {
    discordClient.user.setPresence({ activities: [{ name: '百日戰記 -最終防衛學園-' }], status: 'online' });
});

//有表情的伺服器id
const guild_id = "1407608060113059932";

discordClient.on('messageCreate', async msg => {
    if (msg.author.bot) return;

    // 判斷是否在指定伺服器
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

discordClient.on('shardDisconnect', (event, shardID) => {
    console.warn(`⚠️ Shard ${shardID} disconnected (${event.code}). 嘗試重新連線中...`);
});

discordClient.on('shardReconnecting', (shardID) => {
    console.log(`🔄 Shard ${shardID} reconnecting...`);
});

discordClient.on('shardResume', (shardID, replayedEvents) => {
    console.log(`✅ Shard ${shardID} reconnected，補回 ${replayedEvents} 個事件`);
});

discordClient.on('error', (err) => {
    console.error("❌ Discord client error:", err);
});

discordClient.on('warn', (info) => {
    console.warn("⚠️ Discord client warning:", info);
});

// Discord Developer Portal 上 Bot 的 Token
discordClient.login(process.env.DISCORD_TOKEN).catch(err => {
    console.error('Discord 登入失敗:', err);
});
