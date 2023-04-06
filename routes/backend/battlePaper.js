const express = require("express");
const router = express.Router();

const { checkToken } = require("../../config/tools/encryptNToken");
const { limiter } = require("../../config/tools/rate-limiter");
const {
  articleList,
  articleCreate,
  articleEdit,
} = require("../../config/tools/articleApi");

router.post("/articleList", limiter, checkToken, async (req, res, next) => {
  articleList(req, res, next, "battle_paper");
});

router.post("/addArticle", limiter, checkToken, (req, res, next) => {
  articleCreate(req, res, next, "battle_paper");
});

router.post("/editArticle", limiter, checkToken, async (req, res, next) => {
  await articleEdit(req, res, next, "battle_paper");
});

module.exports = router;
