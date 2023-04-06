const express = require("express");
const router = express.Router();

const { checkToken } = require("../../config/tools/encryptNToken");
const { limiter } = require("../../config/tools/rate-limiter");

router.post("/list", limiter, checkToken, async (req, res, next) => {});

module.exports = router;
