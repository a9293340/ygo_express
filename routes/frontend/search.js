const express = require('express');
const router = express.Router();

const { MongooseCRUD } = require('../../config/MongoDb/Api');
const {
  checkToken,
  makeToken,
  decryptRes,
  encryptRes,
} = require('../../config/tools/encryptNToken');
const { limiter } = require('../../config/tools/rate-limiter');
const { articleList } = require('../../config/tools/articleApi');

router.post('/search', limiter, checkToken, async (req, res, next) => {
  const { content, article_type, article_subtype } = decryptRes(req.body.data);
});

module.exports = router;
