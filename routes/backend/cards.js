const express = require('express');
const router = express.Router();
const {
	checkToken,
	decryptRes,
	fuzzySearch,
} = require('../../config/tools/encryptNToken');
const { limiter } = require('../../config/tools/rate-limiter');
const { pAggregate } = require('../../config/tools/postAction');
const { articleEdit } = require('../../config/tools/articleApi');

router.post('/list', limiter, checkToken, async (req, res, next) => {
	const { filter, limit, page } = decryptRes(req.body.data);

	const { atk_t, atk_l, def_t, def_l, rarity, name, id, ...useful } = filter;
	let target = {};
	// atk
	if (atk_l | atk_t) {
		target['atk'] = {};
		if (atk_l) target['atk']['$gte'] = atk_l;
		if (atk_t) target['atk']['$lte'] = atk_t;
	}
	// def
	if (def_l | def_t) {
		target['def'] = {};
		if (def_l) target['def']['$gte'] = def_l;
		if (def_t) target['def']['$lte'] = def_t;
	}
	// rarity
	if (rarity) {
		target['rarity'] = {
			$elemMatch: { $eq: rarity },
		};
	}
	// id
	if (id) target['id'] = fuzzySearch(id);
	// _id number type attribute start product_information_type
	if (useful) target = { ...target, ...useful };

	let aggregateFilter = [];

	// name
	if (name) {
		aggregateFilter.push({
			$search: {
				index: 'cards',
				text: {
					query: name,
					path: {
						wildcard: '*',
					},
				},
			},
		});
	}
	aggregateFilter.push({ $match: target });

	pAggregate(res, 'cards', aggregateFilter, { limit, page });
});

router.post('/add', limiter, checkToken, async (req, res, next) => {
	let { token, tokenReq, ...useful } = decryptRes(req.body.data);
	canNotBeSameBeforeAdd(res, next, 'cards', useful, 'id');
});

router.post('/edit', limiter, checkToken, async (req, res, next) => {
	articleEdit(req, res, next, 'cards');
});

module.exports = router;
