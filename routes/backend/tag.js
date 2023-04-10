const express = require('express');
const { limiter } = require('../../config/tools/rate-limiter');
const {
	checkToken,
	decryptRes,
	fuzzySearch,
} = require('../../config/tools/encryptNToken');
const { pAdd, pList } = require('../../config/tools/postAction');
const { MongooseCRUD } = require('../../config/MongoDb/Api');
const { articleEdit } = require('../../config/tools/articleApi');
const router = express.Router();

router.post('/list', limiter, checkToken, async (req, res, next) => {
	const { filter, limit, page } = decryptRes(req.body.data);
	const tag = fuzzySearch(filter.tag);
	pList(res, next, 'tag', { tag }, false, {
		limit,
		page,
	});
});

router.post('/add', limiter, checkToken, async (req, res, next) => {
	const { token, tokenReq, ...use } = decryptRes(req.body.data);
	const arr = await MongooseCRUD('R', 'tag', { tag: use.tag });
	if (arr.length) next(10012);
	else pAdd(res, next, 'tag', use);
});

router.post('/edit', limiter, checkToken, async (req, res, next) => {
	articleEdit(req, res, next, 'tag');
});

module.exports = router;
