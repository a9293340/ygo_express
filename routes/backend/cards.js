const express = require("express");
const router = express.Router();
const {
  checkToken,
  decryptRes,
  encryptRes,
} = require("../../config/tools/encryptNToken");
const { limiter } = require("../../config/tools/rate-limiter");
const { MongooseCRUD } = require("../../config/MongoDb/Api");

router.post("/list", limiter, checkToken, (req, res, next) => {
  const { filter, limit, page } = decryptRes(req.body.data);
  MongooseCRUD("R", "cards", filter).then((arr, err) => {
    if (err) next(err);
    else if (!Number.isInteger(limit) || !Number.isInteger(page)) next(10004);
    else {
      res.status(200).json({
        error_code: 0,
        data: encryptRes({
          total: arr.length,
          list: arr.slice(page * limit, (page + 1) * limit),
        }),
      });
    }
  });
});

router.post("/add", limiter, checkToken, async (req, res, next) => {
  const { token, tokenReq, ...useful } = decryptRes(req.body.data);
  if (!useful.id) next(10004);
  else {
    const arr = await MongooseCRUD("R", "cards", {
      id: useful.id,
    });
    if (arr.length) next(10012);
    else
      MongooseCRUD("C", "cards", useful).then((arr, err) => {
        if (err) next(err);
        else {
          res.status(200).json({
            error_code: 0,
            data: encryptRes({}),
          });
        }
      });
  }
});

router.post("/edit", limiter, checkToken, async (req, res, next) => {
  const { token, tokenReq, _id, ...use } = decryptRes(req.body.data);
  if (!_id) next(10004);
  else {
    try {
      let arr = await MongooseCRUD("Uo", "cards", { _id }, use);
      res.status(200).json({
        error_code: !arr["matchedCount"] ? 10007 : 0,
        data: encryptRes({}),
      });
    } catch (e) {
      next(10003);
    }
  }
});

module.exports = router;
