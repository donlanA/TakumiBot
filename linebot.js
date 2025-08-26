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
    'Authorization': 'Bearer HNprujxW6l55p7JhdIDM8p577oezwhMJHAvX2Zt0Hw7WP3SWFJpvPDWHHb9hbJl+HENp70CE27PIqKHj40sQGH5pDBmnshgJCs7dOPFmcNb/EFb3aeTXOj9BwYqILXtL5dBDPCFmTYY2VR+mdVgO8gdB04t89/1O/w1cDnyilFU='
    
  }
}

router.get('/', (req, res) => {
  res.send('LINE bot');
});

router.post('/', jsonParser, function(req, res) {

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
      rplyVal = parseInput(rplyToken, msg); 
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

// app.listen(app.get('port'), function() {
//   console.log('Node app is running on port', app.get('port'));
// });

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


// function SendMsg(rplyToken, rplyVal) {
//   let rplyObj = {
//     replyToken: rplyToken,
//     messages: rplyVal
//   }

//   let rplyJson = JSON.stringify(rplyObj); 
  
//   var request = https.request(options, function(response) {
//     console.log('Status: ' + response.statusCode);
//     console.log('Headers: ' + JSON.stringify(response.headers));
//     response.setEncoding('utf8');
//     response.on('data', function(body) {
//       console.log(body); 
//     });
//   });
//   request.on('error', function(e) {
//     console.log('Request error: ' + e.message);
//   })
//   request.end(rplyJson);
// }

module.exports = router;