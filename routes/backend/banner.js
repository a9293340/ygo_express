const express = require('express');
const { limiter } = require('../../config/tools/rate-limiter');
const { checkToken, decryptRes } = require('../../config/tools/encryptNToken');
const { toISODate } = require('../../config/tools/toDate');
const { pAdd, pList, pEdit } = require('../../config/tools/postAction');
const router = express.Router();

router.post('/add', limiter, checkToken, (req, res, next) => {
  let { token, tokenReq, ...use } = decryptRes(req.body.data);
  console.log(use);
  use.date = new Date();
  pAdd(res, next, 'banner', use);
});

router.post('/list', limiter, checkToken, (req, res, next) => {
  const { filter, limit, page } = decryptRes(req.body.data);
  const target =
    filter.begin_date && filter.end_date
      ? {
          date: {
            $gte: toISODate(filter.begin_date),
            $lte: toISODate(filter.end_date),
          },
        }
      : {};
  pList(res, next, 'banner', target, true, {
    limit,
    page,
  });
});

router.post('/edit', limiter, checkToken, (req, res, next) => {
  let { token, tokenReq, _id, ...use } = decryptRes(req.body.data);
  use.date = new Date();
  if (!_id) next(10004);
  else {
    try {
      pEdit(res, next, 'banner', use, _id);
    } catch (e) {
      next(10003);
    }
  }
});

module.exports = router;
