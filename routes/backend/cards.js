const express = require('express');
const router = express.Router();
const { checkToken, decryptRes, fuzzySearch } = require('../../config/tools/encryptNToken');
const { limiter } = require('../../config/tools/rate-limiter');
const { pAggregate, canNotBeSameBeforeAdd, pAdd } = require('../../config/tools/postAction');
const { articleEdit } = require('../../config/tools/articleApi');

router.post('/list', limiter, checkToken, async (req, res, next) => {
  let { filter, limit, page } = decryptRes(req.body.data);
  if (filter === undefined) filter = {};
  const { atk_t, atk_l, def_t, def_l, rarity, name, effact, id, number, ...useful } = filter;
  let target = {};
  // atk
  if (atk_l >= 0 || atk_t >= 0) {
    target['atk'] = {};
    if (atk_t === atk_l) target['atk'] = atk_t;
    else {
      if (atk_l >= 0) target['atk']['$gte'] = atk_l;
      if (atk_t >= 0) target['atk']['$lte'] = atk_t;
    }
  }
  // def
  if (def_l >= 0 || def_t >= 0) {
    target['def'] = {};
    if (def_l === def_t) target['def'] = def_t;
    else {
      if (def_l >= 0) target['def']['$gte'] = def_l;
      if (def_t >= 0) target['def']['$lte'] = def_t;
    }
  }
  console.log(target);
  // rarity
  if (rarity) {
    target['rarity'] = {
      $elemMatch: { $eq: rarity },
    };
  }
  // id
  if (id) target['id'] = fuzzySearch(id);
  if (name) target['name'] = fuzzySearch(name);
  if (number) {
    if (limit !== 1)
      target['number'] = typeof number === 'string' ? fuzzySearch(number) : { $in: number };
    else target['number'] = number;
  }
  // _id number type attribute start product_information_type
  if (useful) target = { ...target, ...useful };

  let aggregateFilter = [];

  // name
  // if (name) {
  // 	aggregateFilter.push({
  // 		$search: {
  // 			index: 'cards',
  // 			text: {
  // 				query: name,
  // 				path: {
  // 					wildcard: '*',
  // 				},
  // 			},
  // 		},
  // 	});
  // }

  if (effact) {
    aggregateFilter.push({
      $search: {
        index: 'cards_effactg',
        text: {
          query: effact,
          path: {
            wildcard: '*',
          },
        },
      },
    });
  }

  aggregateFilter.push({ $match: target });
  if (limit !== 1)
    aggregateFilter.push({
      $project: {
        price_info: 0,
        price_yuyu: 0,
      },
    });
  aggregateFilter.push({ $sort: { id: 1 } });
  aggregateFilter.push({ $skip: page * limit });
  aggregateFilter.push({ $limit: limit });
  await pAggregate(res, 'cards', aggregateFilter, { limit, page });
});

router.post('/add', limiter, checkToken, async (req, res, next) => {
  let { token, tokenReq, ...useful } = decryptRes(req.body.data);
  // await canNotBeSameBeforeAdd(res, next, "cards", useful, "id");
  pAdd(res, next, 'cards', useful);
});

router.post('/edit', limiter, checkToken, async (req, res, next) => {
  await articleEdit(req, res, next, 'cards');
});

module.exports = router;
