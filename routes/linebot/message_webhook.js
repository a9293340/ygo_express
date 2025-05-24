const line = require('@line/bot-sdk');
const express = require('express');
const router = express.Router();

// LINE Bot 設定
const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

// 建立 LINE Bot 客戶端(line-webhook)
const client = new line.Client(config);

// 授權的管理者 ID (從環境變數讀取)
const MANAGER_IDS = process.env.LINE_MANAGER_IDS ? process.env.LINE_MANAGER_IDS.split(',') : [];

// Webhook 路由
router.post('/', line.middleware(config), (req, res) => {
  // 處理所有收到的事件
  Promise.all(req.body.events.map(handleEvent))
    .then(result => res.json(result))
    .catch(err => {
      console.error('處理事件時發生錯誤:', err);
      res.status(500).end();
    });
});

// 處理單一事件
async function handleEvent(event) {
  // 只處理訊息事件
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  // 檢查是否為授權的管理者
  if (!MANAGER_IDS.includes(event.source.userId)) {
    console.log('未授權的用戶嘗試使用機器人:', event.source.userId);
    return Promise.resolve(null);
  }

  // 處理文字訊息
  const userMessage = event.message.text;
  console.log('收到管理者訊息:', userMessage);

  // 基本的回應邏輯 (您可以根據需求修改)
  let replyMessage = '您好！我收到您的訊息了。';

  // 這裡可以加入更複雜的訊息處理邏輯
  if (userMessage.toLowerCase().includes('hello') || userMessage.includes('你好')) {
    replyMessage = '您好！有什麼我可以幫助您的嗎？';
  }

  // 回覆訊息
  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: replyMessage,
  });
}

module.exports = router;
