const express = require('express');
const router = express.Router();
const { v4 } = require('uuid');
const nodemailer = require('nodemailer');

const { MongooseCRUD } = require('../../config/MongoDb/Api');
const {
  checkToken,
  makeToken,
  decryptRes,
  encryptRes,
} = require('../../config/tools/encryptNToken');
const { limiter } = require('../../config/tools/rate-limiter');
const { pEdit } = require('../../config/tools/postAction');

// login
router.post('/login', limiter, async (req, res, next) => {
  const user = decryptRes(req.body.data);

  if (!user || typeof user.account !== 'string' || typeof user.password !== 'string') next(10003);
  else
    MongooseCRUD('R', 'admin', { account: user.account }).then(async (arr, err) => {
      if (err || arr.length < 1) next(err || 10004);
      else if (!arr.length) next(11001);
      else if (user.password !== arr[0]['password']) next(11002);
      else if (arr[0].status) next(10008);
      else {
        const tokenArr = await MongooseCRUD('R', 'frontend_token', { tokenReq: user.account });
        res.status(200).json({
          error_code: tokenArr.length && new Date() - tokenArr[0].date > 60 * 60 * 1000 ? 10009 : 0,
          data: await makeToken('f', tokenArr.length, user.account),
        });
      }
    });
});

// logout
router.post('/logout', limiter, checkToken, async (req, res, next) => {
  const { tokenReq, token } = decryptRes(req.body.data);
  if (typeof token !== 'string' || typeof tokenReq !== 'string') next(10003);
  else {
    await MongooseCRUD('D', 'frontend_token', { token, tokenReq });
    res.status(200).json({ error_code: 0, data: encryptRes({}) });
  }
});

// resetPassword

router.post('/resetPassword', limiter, checkToken, async (req, res, next) => {
  const { tokenReq, old_password, new_password } = decryptRes(req.body.data);
  console.log(tokenReq, old_password, new_password);
  console.log(
    typeof new_password !== 'string' ||
      typeof old_password !== 'string' ||
      typeof tokenReq !== 'string',
  );
  if (
    typeof new_password !== 'string' ||
    typeof old_password !== 'string' ||
    typeof tokenReq !== 'string'
  )
    next(10003);
  else {
    try {
      const user = await MongooseCRUD('R', 'admin', { account: tokenReq });
      if (!user.length) next(11001);
      else if (new_password === user[0]['password']) next(11007);
      else if (user[0].status) next(10008);
      else pEdit(res, next, 'admin', { password: new_password }, user[0]._id);
    } catch (error) {
      next(error);
    }
  }
});

// Add
router.post('/add', limiter, checkToken, async (req, res, next) => {
  const user = decryptRes(req.body.data);
  if (!user) next(10003);
  else {
    let temp = {
      name: user.name,
      account: user.account,
      create_date: user.create_date,
      password: user.password,
      email: user.email,
      photo: '',
      status: 1,
      type: 2,
    };
    try {
      const accountTemp = await MongooseCRUD('R', 'admin', {
        $or: [{ account: user.account }, { email: user.email }],
      });
      if (accountTemp.length) next(11003);
      else {
        const transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com', // SMTP 服务器
          port: 587, // SMTP 端口
          secure: false, // 如果端口为 465 则为 true，其他端口一般为 false
          auth: {
            user: process.env.EMAIL, // 你的邮箱账户
            pass: process.env.EPASS, // 你的邮箱密码
          },
        });
        const signWords = `
          <br><br>
          <br><br>
          <img src='https://cardtime.tw/favicon-32x32.png'>
          <span style='font-size: 20px;font-weight: 800;'>卡壇 CardTime - 台灣遊戲王相關資訊網</span>
          <p>聯絡信箱 : ygo.cardtime.gmail.com</p>
        `;
        const mailOptions = {
          from: 'erichong19900327@gmail.com',
          to: user.email,
          subject: 'CardTime卡壇 註冊確認連結',
          html: `
            <p>請收到此封郵件後，需在<span style='font-size: 18px;font-weight: 800;color:red;'>24小時</span>內點選下方連結確認，非常感謝!</p>
            <a href="https://cardtime.tw/email_check/${encryptRes({
              account: user.account,
              date: new Date().toTimeString(),
            }).replace(/\//g, '_')}">請點選此連結
            </a>
            <p> 若有任何問題請至官網查詢 : https://cardtime.tw/</a>
            <p> 或請來信至 : ygo.cardtime.gmail.com</a>
            
            
            

            ${signWords}
          `,
        };
        transporter.sendMail(mailOptions, async function (error, info) {
          if (error) {
            console.log('Error sending email: ' + error);
          } else {
            console.log('Email sent: ' + info.response);
            await MongooseCRUD('C', 'admin', temp);
            res
              .status(200)
              .json({ error_code: 0, data: encryptRes({ token: JSON.stringify(temp) }) });
          }
        });
      }
    } catch (e) {
      next(10003);
    }
  }
});

// edit
router.post('/edit', limiter, checkToken, async (req, res, next) => {
  const { token, tokenReq, _id, ...other } = decryptRes(req.body.data);
  if (!_id && !other) next(10003);
  else pEdit(res, next, 'admin', other, _id);
});

// verify
router.post('/verify', limiter, async (req, res, next) => {
  let { verify_code } = decryptRes(req.body.data);
  if (!verify_code) next(10003);
  else {
    const { account, date, email } = verify_code;
    console.log(account, date, email);
    if (!account || !date || new Date() - new Date(date) > 24 * 60 * 60) next(11005);
    else {
      // 註冊帳號
      if (!email) {
        const user = await MongooseCRUD('R', 'admin', { account });
        if (!user.length) next(11001);
        else {
          const arr = await MongooseCRUD('Uo', 'admin', { account }, { status: 0 });
          res.status(200).json({
            error_code: !arr['matchedCount'] ? 10007 : 0,
            date: encryptRes({}),
          });
        }
      }
      // 忘記密碼
      else {
        const user = await MongooseCRUD('R', 'admin', { account, email });
        if (!user.length) next(11001);
        else {
          const password = v4();
          const arr = await MongooseCRUD('Uo', 'admin', { account }, { password });
          res.status(200).json(
            !arr['matchedCount']
              ? {
                  error_code: 10007,
                  date: encryptRes({}),
                }
              : {
                  error_code: 0,
                  data: encryptRes({ password }),
                },
          );
        }
      }
    }
  }
});

module.exports = router;
