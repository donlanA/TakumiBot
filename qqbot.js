// QQ Bot
require('dotenv').config();
const { createOpenAPI, createWebsocket } = require('qq-guild-bot');
const { parseInput } = require('./replies.js');

const qqConfig = {
    appID: process.env.QQ_APP_ID,   // QQ Bot 的 AppID
    token: process.env.QQ_TOKEN,    // QQ Bot 的 Token
    intents: ['PUBLIC_GUILD_MESSAGES'], // 這邊先只接收公開頻道訊息
    sandbox: false,
};

const client = createOpenAPI(qqConfig);
const ws = createWebsocket(qqConfig);

ws.on('READY', (event) => {
    console.log("✅ QQ Bot Connected.");
});

// 處理訊息事件
ws.on('PUBLIC_GUILD_MESSAGES', async (event) => {
    try {
        // event 格式: https://bot.q.qq.com/wiki/develop/api-v2/openapi/message/post_messages.html
        const msg = event.msg;
        if (!msg) return;

        let displayName = msg.author?.username || "QQUser";
        let content = msg.content;

        let reply = parseInput(null, content, false, displayName);

        if (reply !== undefined && reply !== null) {
            if (Array.isArray(reply)) {
                let textMsg = reply.find(m => m.type === "text");
                if (textMsg) {
                    await client.messageApi.postMessage(msg.channel_id, {
                        content: textMsg.text
                    });
                }
            } else if (typeof reply === 'string' && reply.length > 0) {
                await client.messageApi.postMessage(msg.channel_id, {
                    content: reply
                });
            }
        }
    } catch (err) {
        console.error("❌ QQ Bot message handler error:", err);
    }
});

ws.on('ERROR', (err) => {
    console.error("❌ QQ Bot WebSocket error:", err);
});
