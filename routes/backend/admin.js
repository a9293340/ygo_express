const express = require("express");
const router = express.Router();

const { MongooseCRUD } = require("../../config/MongoDb/Api");
const { checkToken, makeToken, decryptRes } = require("../encryptNToken");
const { limiter } = require("../rate-limiter");

// Log in
router.post("/login", limiter, async (req, res, next) => {
  const user = decryptRes(req.body.data);
  if (!user) next(10003);
  else
    MongooseCRUD("R", "admin", { account: user.account }).then(
      async (arr, err) => {
        if (err || arr.length > 1) next(err || 10004);
        else if (!arr.length) next(11001);
        else if (!(user.password === arr[0]["password"])) next(11002);
        else {
          const tokenArr = await MongooseCRUD("R", "backend_token", {
            tokenRef: user.account,
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
router.post("/logout", checkToken, limiter, async (req, res, next) => {
  const { tokenRef, token } = decryptRes(req.body.data);
  if (req["error_code"]) next(req["error_code"]);
  else {
    await MongooseCRUD("D", "backend_token", { tokenRef, token });
    res.status(200).json({ error_code: 0, data: {} });
  }
});

// list
router.post("/list", limiter, checkToken, (req, res, next) => {
  const { filter, limit, page } = decryptRes(req.body.data);
  console.log(filter, limit, page);
  if (req["error_code"]) next(req["error_code"]);
  else {
    MongooseCRUD("R", "admin", filter, {}, {}).then((arr, err) => {
      if (err) next(err);
      else if (!Number.isInteger(limit) || !Number.isInteger(page)) next(10004);
      else {
        res.status(200).json({
          error_code: 0,
          data: {
            total: arr.length,
            list: arr.slice(page * limit, (page + 1) * limit),
          },
        });
      }
    });
  }
});

// Add
router.post("/add", limiter, async (req, res, next) => {
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
        res.status(200).json({ error_code: 0, data: {} });
      }
    } catch (e) {
      next(10003);
    }
    // MongooseCRUD("R", "admin", {
    //   account: temp.account,
    // }).then((arr, err) => {
    //   if (err || arr.length > 1) next(err || 10004);
    //   else if (arr.length) next(11003);
    //   else {
    //     MongooseCRUD("C", "admin", temp).then((ar, er) => {
    //       if (er) next();
    //     });
    //   }
    // });
  }
  // MongooseCRUD("R", "admin", {
  //   account: temp.account,
  // }).then( (arr,err) => {
  //   if (err || arr.length > 1) next(err || 10004);
  //   else if (arr.length) next(11003);
  //   else{
  //     MongooseCRUD('C','admin',temp).then((ar,er) => {
  //       if(er) next()
  //     });
  //
  //   }
  //
  // });
  // MongooseCRUD("C", "admin", req.body).then((arr, err) => {
  //   if (err) {
  //     res.status(404);
  //     res.json({ error_code: "failed", data: [] });
  //   } else {
  //     res.status(201);
  //     res.json({ error_code: "00", data: [] });
  //     //
  //   }
  // });
});

module.exports = router;
