const express = require("express");
const router = express.Router();

const {
	checkToken,
	decryptRes,
	fuzzySearch,
} = require("../../config/tools/encryptNToken");
const { limiter } = require("../../config/tools/rate-limiter");
const { pList } = require("../../config/tools/postAction");
const { MongooseCRUD } = require("../../config/MongoDb/Api");

const checkTagSearch = async (title) => {
	try {
		const tag = await MongooseCRUD("R", "tag", {});
		let arr = [];
		for (let i = 0; i < tag.length; i++) {
			const ta = tag[i].tag;
			if (title.indexOf(ta) !== -1) arr.push(ta);
			else if (ta.indexOf(title) !== -1) arr.push(ta);
		}
		arr = [...new Set(arr)];
		return arr;
	} catch (error) {
		return [];
	}
};

router.post("/list", limiter, checkToken, async (req, res, next) => {
	const { title, article_type, article_subtype, page, limit } = decryptRes(
		req.body.data
	);
	let tags = [];
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
		case 5:
			article_db = "battle_paper";
			break;
		case 6:
			article_db = "product_information";
			break;
	}
	let filter = {};
	if (title) {
		tags = await checkTagSearch(title);
		if (!tags.length) filter.title = fuzzySearch(title);
		else {
			filter["$or"] = [
				{
					title: fuzzySearch(title),
				},
				{
					tag: {
						$elemMatch: {
							tag: { $in: tags },
						},
					},
				},
			];
		}
	}
	if (Number.isInteger(article_subtype)) filter.type = article_subtype;
	// console.log(filter);
	pList(res, next, article_db, filter, false, {
		limit,
		page,
	});
});

module.exports = router;
