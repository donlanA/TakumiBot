// Line Bot
require('dotenv').config();
const { parseInput } = require('./replies.js');

var express = require('express');
var bodyParser = require('body-parser');
var https = require('https');  
const router = express.Router();

var jsonParser = bodyParser.json();

var options = {
  host: 'api.line.me',
  port: 443,
  path: '/v2/bot/message/reply',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + process.env.LINE_TOKEN
  }
}

router.get('/', (req, res) => {
  res.send('LINE bot');
});

// 取得使用者名稱
function getUserProfile(userId) {
  return new Promise((resolve, reject) => {
    const optionsProfile = {
      host: 'api.line.me',
      port: 443,
      path: `/v2/bot/profile/${userId}`,
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + process.env.LINE_TOKEN
      }
    };

    const reqProfile = https.request(optionsProfile, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          let json = JSON.parse(body);
          resolve(json.displayName); 
        } catch (e) {
          reject(e);
        }
      });
    });

    reqProfile.on('error', (e) => reject(e));
    reqProfile.end();
  });
}

router.post('/', jsonParser,async function(req, res) {

  if (!req.body || !req.body.events || !Array.isArray(req.body.events) || req.body.events.length === 0) {
    res.status(200).end();
    return;
  }
  
  let event = req.body.events[0];
  let type = event.type;
  let msgType = event.message.type;
  let msg = event.message.text;
  let rplyToken = event.replyToken;

  let rplyVal = null;
  console.log(msg);

  if (type == 'message' && msgType == 'text') {
    try {
      let userId = event.source.userId;
      let displayName = await getUserProfile(userId); // 呼叫 API 取得名稱
      rplyVal = parseInput(rplyToken, msg, false, displayName); 
    } 
    catch(e) {
      console.log('catch error', e);
    }
  }

  if (rplyVal) {
    replyMsgToLine(rplyToken, rplyVal); 
  } else {
    console.log('Do not trigger'); 
  }

  res.status(200).end();
});

function replyMsgToLine(rplyToken, rplyVal) {
  let rplyObj = {
    replyToken: rplyToken,
    messages: [
      {
        type: "text",
        text: rplyVal
      }
    ]
  }

  let rplyJson = JSON.stringify(rplyObj); 
  
  var request = https.request(options, function(response) {
    console.log('Status: ' + response.statusCode);
    console.log('Headers: ' + JSON.stringify(response.headers));
    response.setEncoding('utf8');
    response.on('data', function(body) {
      console.log(body); 
    });
  });
  request.on('error', function(e) {
    console.log('Request error: ' + e.message);
  })
  request.end(rplyJson);
}

module.exports = router;