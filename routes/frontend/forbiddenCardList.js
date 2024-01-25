const express = require('express');
const { limiter } = require('../../config/tools/rate-limiter');
const { MongooseCRUD } = require('../../config/MongoDb/Api');
const { decryptRes, encryptRes } = require('../../config/tools/encryptNToken');
const router = express.Router();

router.post('/list', limiter, async (req, res, next) => {
  console.log(123);
  const { number, type } = decryptRes(req.body.data);
  let filter = {};
  if (number) filter.number = number;
  if (Number.isInteger(type)) filter.type = type;

  const data = await MongooseCRUD('R', 'forbidden_card_list', filter);

  res.status(200).json({
    error_code: 0,
    data: encryptRes({
      total: data.length,
      list: data,
    }),
  });
});

module.exports = router;
