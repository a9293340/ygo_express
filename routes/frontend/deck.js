const express = require("express");
const router = express.Router();

const { MongooseCRUD } = require("../../config/MongoDb/Api");
const {
	checkToken,
	decryptRes,
	encryptRes,
	fuzzySearch,
} = require("../../config/tools/encryptNToken");
const { limiter } = require("../../config/tools/rate-limiter");
const { pList, pAdd } = require("../../config/tools/postAction");
const { articleEdit } = require("../../config/tools/articleApi");
const { toISODate } = require("../../config/tools/toDate");

router.post("/deckList", limiter, checkToken, async (req, res, next) => {
	const { page, limit, filter } = decryptRes(req.body.data);
	console.log(page, limit, filter);
	try {
		if (limit > 1) {
			let target = {};
			const { title, begin_date, end_date, ...other } = filter;
			if (title) target.title = fuzzySearch(title);
			if (begin_date && end_date)
				target.create_date = {
					$gte: toISODate(begin_date),
					$lte: toISODate(end_date),
				};
			if (other) target = { ...target, ...other };
			pList(
				res,
				next,
				"decks",
				target,
				begin_date && end_date,
				{ limit, page },
				{ main_deck: 0, extra_deck: 0, side_deck: 0 }
			);
		} else {
			let deck = (await MongooseCRUD("R", "decks", filter, { limit, page }))[0];
			console.log(deck);
			const getCardsInfo = async (_id, deck) => {
				const info = await MongooseCRUD(
					"R",
					"cards",
					{ _id },
					{},
					{ price_info: 0 }
				);
				return deck.map((item) => {
					let final = info.find((x) => x._id.toString() === item.card_id);
					return {
						card_id: final._id,
						card_rarity: item.card_rarity,
						card_number: final.number,
						card_num_id: final.id,
					};
				});
			};
			if (deck.main_deck.length) {
				deck.main_deck = await getCardsInfo(
					deck.main_deck.map((x) => x.card_id),
					deck.main_deck
				);
			}
			if (deck.extra_deck.length) {
				deck.extra_deck = await getCardsInfo(
					deck.extra_deck.map((x) => x.card_id),
					deck.extra_deck
				);
			}
			if (deck.side_deck.length) {
				deck.side_deck = await getCardsInfo(
					deck.side_deck.map((x) => x.card_id),
					deck.side_deck
				);
			}
			res.status(200).json({
				error_code: 0,
				data: encryptRes({
					total: 1,
					list: [deck],
				}),
			});
		}
	} catch (error) {
		console.log(error);
		next(10003);
	}
});

router.post("/add", limiter, checkToken, async (req, res, next) => {
	const { token, tokenReq, ...filter } = decryptRes(req.body.data);
	if (!filter || typeof filter !== "object") next(10003);
	else pAdd(res, next, "decks", filter);
});

router.post("/edit", limiter, checkToken, async (req, res, next) => {
	await articleEdit(req, res, next, "decks");
});

router.post("/delete", limiter, checkToken, async (req, res, next) => {
	const { token, tokenReq, ...filter } = decryptRes(req.body.data);
	try {
		let arr = await MongooseCRUD("D", "decks", filter);
		res.status(200).json({
			error_code: !arr["matchedCount"] ? 10007 : 0,
			data: encryptRes({}),
		});
	} catch (error) {
		console.log(error);
		next(10003);
	}
});

module.exports = router;
