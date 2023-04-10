const express = require('express');
const router = express.Router();
const { checkToken, decryptRes } = require('../../config/tools/encryptNToken');
const { limiter } = require('../../config/tools/rate-limiter');
const { MongooseCRUD } = require('../../config/MongoDb/Api');
const { pList, pAdd } = require('../../config/tools/postAction');
const { articleEdit } = require('../../config/tools/articleApi');

router.post('/list', limiter, checkToken, (req, res, next) => {
	const { filter, limit, page } = decryptRes(req.body.data);
	pList(res, next, 'cards', filter, false, { limit, page });
});

router.post('/add', limiter, checkToken, async (req, res, next) => {
	const { token, tokenReq, ...useful } = decryptRes(req.body.data);
	if (!useful.id) next(10004);
	else {
		const arr = await MongooseCRUD('R', 'cards', {
			id: useful.id,
		});
		if (arr.length) next(10012);
		else pAdd(res, next, 'cards', useful);
	}
});

router.post('/edit', limiter, checkToken, async (req, res, next) => {
	articleEdit(req, res, next, 'cards');
});

module.exports = router;
