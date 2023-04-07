const express = require("express");
const router = express.Router();

const { MongooseCRUD } = require("../../config/MongoDb/Api");
const {
  checkToken,
  makeToken,
  decryptRes,
  encryptRes,
} = require("../../config/tools/encryptNToken");
const { limiter } = require("../../config/tools/rate-limiter");

// Log in
router.post("/login", limiter, async (req, res, next) => {
  const user = decryptRes(req.body.data);
  if (!user) next(10003);
  else
    MongooseCRUD("R", "admin", { account: user.account }).then(
      async (arr, err) => {
        if (err || arr.length > 1) next(err || 10004);
        else if (!arr.length) next(11001);
        else if (!(user.password === arr[0]["password"]) || arr[0].status)
          next(11002);
        else {
          const tokenArr = await MongooseCRUD("R", "backend_token", {
            tokenReq: user.account,
          });
          res.status(200).json({
            error_code: !tokenArr.length ? 0 : 10009,
            data: await makeToken("b", tokenArr.length, user.account),
          });
        }
      }
    );
});

// logout
router.post("/logout", limiter, checkToken, async (req, res, next) => {
  const { tokenReq, token } = decryptRes(req.body.data);
  await MongooseCRUD("D", "backend_token", { tokenReq, token });
  res.status(200).json({ error_code: 0, data: encryptRes({}) });
});

// list
router.post("/list", limiter, checkToken, (req, res, next) => {
  const { filter, limit, page } = decryptRes(req.body.data);
  console.log(filter, limit, page);
  MongooseCRUD("R", "admin", filter, {}, {}).then((arr, err) => {
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

// Add
router.post("/add", limiter, checkToken, async (req, res, next) => {
  const user = decryptRes(req.body.data);
  if (!user) next(10003);
  else {
    let temp = {
      name: user.name,
      account: user.account,
      create_date: user.create_date,
      password: user.password,
      email: user.email,
      photo: "",
      status: 0,
      type: user.type,
    };
    console.log(temp);
    try {
      const accountTemp = await MongooseCRUD("R", "admin", {
        $or: [{ account: user.account }, { email: user.email }],
      });
      if (accountTemp.length) next(11003);
      else {
        await MongooseCRUD("C", "admin", temp);
        res.status(200).json({ error_code: 0, data: encryptRes({}) });
      }
    } catch (e) {
      next(10003);
    }
  }
});

// edit
router.post("/edit", limiter, checkToken, async (req, res, next) => {
  const { token, tokenReq, _id, ...other } = decryptRes(req.body.data);
  if (!_id && !other) next(10003);
  else {
    try {
      await MongooseCRUD("Uo", "admin", { _id }, other);
      res.status(200).json({ error_code: 0, data: encryptRes({}) });
    } catch (e) {
      next(10003);
    }
  }
});

module.exports = router;