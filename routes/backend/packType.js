const express = require('express');
const { limiter } = require('../../config/tools/rate-limiter');
const { checkToken, decryptRes, fuzzySearch } = require('../../config/tools/encryptNToken');
const { canNotBeSameBeforeAdd, pList } = require('../../config/tools/postAction');
const { articleEdit } = require('../../config/tools/articleApi');
const router = express.Router();

router.post('/add', limiter, checkToken, async (req, res, next) => {
  const { token, tokenReq, ...useful } = decryptRes(req.body.data);
  await canNotBeSameBeforeAdd(res, next, 'product_information_type', useful, 'name');
});

router.post('/list', limiter, checkToken, (req, res, next) => {
  const { filter, limit, page } = decryptRes(req.body.data);
  // console.log(filter);
  let packTypeFilter = {};
  if (Number.isInteger(filter.status)) packTypeFilter.status = filter.status;
  if (filter.name) packTypeFilter.name = fuzzySearch(filter.name);
  pList(res, next, 'product_information_type', packTypeFilter, false, {
    limit,
    page,
  });
});

router.post('/edit', limiter, checkToken, async (req, res, next) => {
  await articleEdit(req, res, next, 'product_information_type');
});

module.exports = router;
