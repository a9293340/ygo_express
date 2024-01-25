const express = require('express');
const router = express.Router();
const { decryptRes, encryptRes } = require('../../config/tools/encryptNToken');
const { limiter } = require('../../config/tools/rate-limiter');
const { MongooseCRUD } = require('../../config/MongoDb/Api');

router.post('/list', limiter, async (req, res, next) => {
  const { token } = decryptRes(req.body.data);
  console.log('!!!!', decryptRes(req.body.data));
  if (!token) next(10004);
  else {
    const data = await MongooseCRUD('R', 'frontend_token', { token });
    res.status(200).json({
      error_code: data && new Date() - new Date(data[0].date) <= 60 * 60 * 1000 * 72 ? 0 : 10009,
      data: encryptRes({}),
    });
  }
});

module.exports = router;
