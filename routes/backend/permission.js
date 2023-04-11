const express = require('express');
const { limiter } = require('../../config/tools/rate-limiter');
const { articleEdit } = require('../../config/tools/articleApi');
const { decryptRes, checkToken } = require('../../config/tools/encryptNToken');
const { canNotBeSameBeforeAdd } = require('../../config/tools/postAction');
const router = express.Router();

router.post('/add', limiter, checkToken, async (req, res, next) => {
	const { token, tokenReq, ...useful } = decryptRes(req.body.data);
	canNotBeSameBeforeAdd(res, next, 'permission', useful, 'type');
});

module.exports = router;
