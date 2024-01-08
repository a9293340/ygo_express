const express = require('express');
const router = express.Router();
const line = require('@line/bot-sdk');
const { MongooseCRUD } = require('../../config/MongoDb/Api');
// const Jimp = require('jimp');
const sharp = require('sharp');
const axios = require('axios');
const fs = require('fs');

// async function downloadAndConvertImage(url, number) {
//   try {
//     const response = await axios.get(url, { responseType: 'arraybuffer' });
//     const image = await Jimp.read(response.data);
//     const fileName = `./public/image/linebot/${number}.jpeg`;
//     await image.writeAsync(fileName);
//     return fileName;
//   } catch (error) {
//     console.error('Error:', error);
//   }
// }

async function downloadAndConvertImage(url, number) {
  try {
    const response = await axios({
      url,
      responseType: 'arraybuffer',
    });

    const convertedBuffer = await sharp(response.data)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toBuffer();
    console.log(convertedBuffer);
    const fileName = `./public/image/linebot/${number}.jpeg`;
    fs.writeFileSync(fileName, convertedBuffer);

    return fileName;
  } catch (error) {
    console.error('Error downloading or converting image:', error);
  }
}

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

const client = new line.Client(config);

router.post('/', (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then(result => res.json(result))
    .catch(err => {
      console.error('Error occurred:', err);
      res.status(500).end();
    });
});

async function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  let replyText = '';
  let img;
  const search = event.message.text.toLowerCase().startsWith('/s ');
  const price = event.message.text.toLowerCase().startsWith('/p ');
  if (search || price) {
    const cardId = await MongooseCRUD('R', 'cards', {
      id: event.message.text.toUpperCase().split(' ')[1],
    });
    if (cardId.length) {
      const card = cardId[0];
      const url = `https://cardtime.tw/api/card-image/cards/${card.number}.webp`;
      await downloadAndConvertImage(url, card.number);
      const jpg = `https://cardtime.tw/api/card-image/linebot/${card.number}.jpeg`;
      console.log(jpg);
      img = {
        type: 'image',
        originalContentUrl: jpg,
        previewImageUrl: jpg,
      };
      if (search) {
        replyText = `
				卡片名稱 : ${card.name}
				攻擊/守備 : ${card.atk}/${card.def}
				屬性 : ${card.attribute} / 種族 : ${card.race ? card.race : '-'} / 等級 : ${
          card.star ? card.star : '-'
        }
				類別 : ${card.type}
				效果 : ${card.effect}
				版本 : ${card.rarity.join(',')}
				`;
      } else {
        const rLens = card.rarity.length;
        const prices = card.price_info.slice(-rLens);
        const priceText = prices.map(
          el => `
					版本 : ${el.rarity} / 均價 : ${el.price_avg} / 最低價 : ${el.price_lowest}
				`,
        );

        replyText = `
				卡片名稱 : ${card.name}
				卡價時間 : ${prices[0].time}
				卡價 : 
				`;
        for (let i = 0; i < priceText.length; i++) {
          const pt = priceText[i];
          replyText += `${pt}`;
        }
      }
    } else replyText = '無此卡片';
  }

  // 處理空消息或未知命令的情況
  if (replyText === '') {
    return Promise.resolve(null);
  }

  // console.log(`Replying with message: ${replyText}`);
  let msg = [{ type: 'text', text: replyText }];
  if (img) msg.push(img);
  console.log(msg);
  return client.replyMessage(event.replyToken, msg);
}

module.exports = router;
