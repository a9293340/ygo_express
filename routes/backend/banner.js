const express = require("express");
const { limiter } = require("../../config/tools/rate-limiter");
const { checkToken, decryptRes } = require("../../config/tools/encryptNToken");
const { toISODate } = require("../../config/tools/toDate");
const { pAdd, pList, pEdit } = require("../../config/tools/postAction");
const { makeImage } = require("../../config/tools/makeImage");
const { MongooseCRUD } = require("../../config/MongoDb/Api");
const fs = require("fs");

const router = express.Router();

router.post("/add", limiter, checkToken, (req, res, next) => {
	let { token, tokenReq, ...use } = decryptRes(req.body.data);
	// console.log(use);
	use.date = new Date();
	if (use.photo_pc) use.photo_pc = makeImage(use.photo_pc, "banner");
	if (use.photo_mobile)
		use.photo_mobile = makeImage(use.photo_mobile, "banner");
	pAdd(res, next, "banner", use);
});

router.post("/list", limiter, checkToken, (req, res, next) => {
	const { filter, limit, page } = decryptRes(req.body.data);
	let target = {};
	if (filter) {
		target =
			filter.begin_date && filter.end_date
				? {
						date: {
							$gte: toISODate(filter.begin_date),
							$lte: toISODate(filter.end_date),
						},
				  }
				: {};
	}
	pList(
		res,
		next,
		"banner",
		target,
		true,
		limit
			? {
					limit,
					page,
			  }
			: false
	);
});

router.post("/edit", limiter, checkToken, async (req, res, next) => {
	let { token, tokenReq, _id, ...use } = decryptRes(req.body.data);
	use.date = new Date();

	try {
		const oldData = await MongooseCRUD("list", "banner", { _id })[0];
		if (oldData && oldData.photo_mobile)
			fs.unlinkSync(`/public/image/banner/${oldData.photo_mobile}`);
		if (oldData && oldData.photo_pc)
			fs.unlinkSync(`/public/image/banner/${oldData.photo_pc}`);
	} catch (error) {
		console.log("No Image");
	}

	if (use.photo_pc) use.photo_pc = makeImage(photo_pc, "banner");
	if (use.photo_mobile) use.photo_mobile = makeImage(photo_mobile, "banner");
	if (!_id) next(10004);
	else {
		try {
			pEdit(res, next, "banner", use, _id);
		} catch (e) {
			next(10003);
		}
	}
});

module.exports = router;
