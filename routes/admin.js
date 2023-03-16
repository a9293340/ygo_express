const express = require("express");
const router = express.Router();

const { MongooseCRUD } = require("../config/MongoDb/Api");
const checkToken = require("./checkToken");
const { limiter } = require("./rate-limiter");

router.get("/list", limiter, checkToken, (req, res, next) => {
  console.log(req.ip);
  MongooseCRUD("R", "admin", {}, {}, {}).then((arr, err) => {
    if (err) {
      res.status(404);
      res.json({ status: "failed", data: [] });
    } else {
      res.status(200);
      res.json({ status: "success", data: { list: arr, total: 50 } });
    }
  });
});

router.post("/add", (req, res) => {
  MongooseCRUD("C", "admin", req.body).then((arr, err) => {
    if (err) {
      res.status(404);
      res.json({ status: "failed", data: [] });
    } else {
      res.status(201);
      res.json({ status: "success", data: [] });
      //
    }
  });
});

// error code
// 00  Success
// 01 Server Error
// 02 Token Expired
// 03 No Data

module.exports = router;
