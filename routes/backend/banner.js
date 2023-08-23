const express = require('express');
const { limiter } = require('../../config/tools/rate-limiter');
const { checkToken, decryptRes } = require('../../config/tools/encryptNToken');
const { toISODate } = require('../../config/tools/toDate');
const { pAdd, pList } = require('../../config/tools/postAction');
const { articleEdit } = require('../../config/tools/articleApi');
const router = express.Router();

router.post('/add', limiter, checkToken, (req, res, next) => {
	const { token, tokenReq, ...use } = decryptRes(req.body.data);
	use.date = toISODate(use.date);
	pAdd(res, next, 'banner', use);
});

router.post('/list', limiter, checkToken, (req, res, next) => {
	const { filter, limit, page } = decryptRes(req.body.data);
	const target =
		filter.begin_date && filter.end_date
			? {
					date: {
						$gte: toISODate(filter.begin_date),
						$lte: toISODate(filter.end_date),
					},
			  }
			: {};
	pList(res, next, 'banner', target, true, {
		limit,
		page,
	});
});

router.post('/edit', limiter, checkToken, (req, res, next) => {
	articleEdit(req, res, next, 'banner');
});

module.exports = router;
