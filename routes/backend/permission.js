const express = require('express');
const { limiter } = require('../../config/tools/rate-limiter');
const { articleEdit } = require('../../config/tools/articleApi');
const { decryptRes, checkToken } = require('../../config/tools/encryptNToken');
const {
	canNotBeSameBeforeAdd,
	pList,
} = require('../../config/tools/postAction');
const { makePermission } = require('../../config/tools/permission');
const { MongooseCRUD } = require('../../config/MongoDb/Api');
const router = express.Router();

router.post('/add', limiter, checkToken, async (req, res, next) => {
	const { token, tokenReq, ...useful } = decryptRes(req.body.data);
	useful.permission = makePermission(useful.permission);
	try {
		const types = (
			await MongooseCRUD(
				'R',
				'permission',
				{},
				{ sort: { type: -1 }, limit: 1 }
			)
		)[0]['type'];
		useful.type = typeof types === 'number' ? types + 1 : undefined;
	} catch (error) {
		useful.type = undefined;
	}
	// console.log(useful.permission);
	canNotBeSameBeforeAdd(res, next, 'permission', useful, 'type');
});

router.post('/list', limiter, checkToken, (req, res, next) => {
	const { filter } = decryptRes(req.body.data);
	pList(res, next, 'permission', filter, false, false);
});

router.post('/edit', limiter, checkToken, async (req, res, next) => {
	articleEdit(req, res, next, 'permission');
});

module.exports = router;
