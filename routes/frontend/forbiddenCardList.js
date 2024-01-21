const express = require('express');
const { limiter } = require('../../config/tools/rate-limiter');
const { MongooseCRUD } = require('../../config/MongoDb/Api');
const router = express.Router();

router.post('/list', limiter, async (req, res, next) => {
  const { number, type } = decryptRes(req.body.data);
  if (!number && !type) next(10004);
  else {
    let filter = {};
    if (number) filter.number = number;
    if (type) filter.type = type;

    const data = await MongooseCRUD('R', 'forbidden_card_list', filter);

    res.status(200).json({
      error_code: 0,
      data: encryptRes({
        total: data.length,
        list: data,
      }),
    });
  }
});

module.exports = router;
