const express = require('express');
const router = express.Router();
const {
	checkToken,
	decryptRes,
	fuzzySearch,
} = require('../../config/tools/encryptNToken');
const { limiter } = require('../../config/tools/rate-limiter');
const { pList } = require('../../config/tools/postAction');
const { articleEdit } = require('../../config/tools/articleApi');

router.post('/list', limiter, checkToken, (req, res, next) => {
	const { filter, limit, page } = decryptRes(req.body.data);
	if (filter.name) filter.name = fuzzySearch(filter.name);
	pList(res, next, 'cards', filter, false, { limit, page });
});

router.post('/add', limiter, checkToken, async (req, res, next) => {
	const { token, tokenReq, ...useful } = decryptRes(req.body.data);
	canNotBeSameBeforeAdd(res, next, 'cards', useful, 'id');
});

router.post('/edit', limiter, checkToken, async (req, res, next) => {
	articleEdit(req, res, next, 'cards');
});

module.exports = router;
