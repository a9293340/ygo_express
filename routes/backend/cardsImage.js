const express = require("express");
const { limiter } = require("../../config/tools/rate-limiter");
const { checkToken, decryptRes } = require("../../config/tools/encryptNToken");
const {
  canNotBeSameBeforeAdd,
  pList,
} = require("../../config/tools/postAction");
const { articleEdit } = require("../../config/tools/articleApi");
const router = express.Router();

router.post("/add", limiter, checkToken, async (req, res, next) => {
  const { token, tokenReq, ...useful } = decryptRes(req.body.data);
  await canNotBeSameBeforeAdd(res, next, "cards_image", useful, "number");
});

router.post("/list", limiter, checkToken, (req, res, next) => {
  const { filter } = decryptRes(req.body.data);
  pList(res, next, "cards_image", filter, false, false);
});

router.post("/edit", limiter, checkToken, async (req, res, next) => {
  await articleEdit(req, res, next, "cards_image");
});

module.exports = router;
