const express = require("express");
const router = express.Router();

const {
  checkToken,
  decryptRes,
  encryptRes,
} = require("../../config/tools/encryptNToken");
const { limiter } = require("../../config/tools/rate-limiter");
const { MongooseCRUD } = require("../../config/MongoDb/Api");

router.post("/list", (req, res, next) => {});

module.exports = router;
