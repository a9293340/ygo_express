const express = require('express');
const router = express.Router();
const dayjs = require('dayjs');
const { toISODate } = require('../../config/tools/toDate');
const { checkToken, decryptRes } = require('../../config/tools/encryptNToken');
const { limiter } = require('../../config/tools/rate-limiter');
const { pList, pAdd } = require('../../config/tools/postAction');
const { articleEdit } = require('../../config/tools/articleApi');

router.post('/list', limiter, checkToken, (req, res, next) => {
	const { filter } = decryptRes(req.body.data);
	const target = {
		$gte: toISODate(
			dayjs(filter.date).startOf('month').format('YYYY-MM-DD')
		),
		$lte: toISODate(dayjs(filter.date).endOf('month').format('YYYY-MM-DD')),
	};
	pList(res, next, 'calendar', target, true, false);
});

router.post('/add', limiter, checkToken, (req, res, next) => {
	const { token, tokenReq, ...use } = decryptRes(req.body.data);
	use.date = toISODate(use.date);
	pAdd(res, next, 'calendar', use);
});

router.post('/edit', limiter, checkToken, (req, res, next) => {
	articleEdit(req, res, next, 'calendar');
});

module.exports = router;
