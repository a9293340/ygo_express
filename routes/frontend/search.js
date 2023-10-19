const express = require("express");
const router = express.Router();

const {
	checkToken,
	decryptRes,
	fuzzySearch,
} = require("../../config/tools/encryptNToken");
const { limiter } = require("../../config/tools/rate-limiter");
const { pList } = require("../../config/tools/postAction");

router.post("/list", limiter, checkToken, async (req, res, next) => {
	const { title, article_type, article_subtype, limit, page } = decryptRes(
		req.body.data
	);
	let article_db = "";
	switch (article_type) {
		case 0:
			article_db = "meta_deck";
			break;
		case 1:
			article_db = "series_introduction";
			break;
		case 2:
			article_db = "useful_card_introduction";
			break;
		case 3:
			article_db = "rules";
			break;
		case 4:
			article_db = "series_story";
			break;
	}
	console.log(1, article_db);
	let filter = {};
	if (title) filter.title = fuzzySearch(title);
	if (article_subtype) filter.type = article_subtype;
	pList(res, next, article_db, filter, true, { limit, page });
});

module.exports = router;
