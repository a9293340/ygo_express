const express = require("express");
const router = express.Router();

const { MongooseCRUD } = require("../config/MongoDb/Api");
const { checkToken, makeToken, decryptRes } = require("./encryptNToken");
const { limiter } = require("./rate-limiter");

// Log in
router.post("/login", async (req, res, next) => {
  const user = decryptRes(req.body.data);
  MongooseCRUD("R", "admin", { account: user.account }).then(
    async (arr, err) => {
      if (err || arr.length > 1) next(err || 10004);
      else {
        if (!arr.length)
          res.status(201).json({ error_code: 11001, data: { token: "" } });
        else {
          user.password === arr[0]["password"]
            ? res.status(201).json({
                error_code: 0,
                data: { token: await makeToken("b") },
              })
            : next(11002);
        }
      }
    }
  );
});

// Add
router.post("/add", checkToken, (req, res) => {
  MongooseCRUD("C", "admin", req.body).then((arr, err) => {
    if (err) {
      res.status(404);
      res.json({ error_code: "failed", data: [] });
    } else {
      res.status(201);
      res.json({ error_code: "00", data: [] });
      //
    }
  });
});

router.get("/list", limiter, checkToken, (req, res, next) => {
  MongooseCRUD("R", "admin", {}, {}, {}).then((arr, err) => {
    if (err) {
      res.status(404);
      res.json({ error_code: "failed", data: [] });
    } else {
      res.status(200);
      res.json({ error_code: 0, data: { list: arr, total: 50 } });
    }
  });
});

// error code
// 00 Success
// 01 Token
// 02 Token Expired
// 03 No Data
// 04 Search Error

module.exports = router;
