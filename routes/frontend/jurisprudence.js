const express = require("express");
const router = express.Router();
const { decryptRes, encryptRes } = require("../../config/tools/encryptNToken");
const { limiter } = require("../../config/tools/rate-limiter");
const { MongooseCRUD } = require("../../config/MongoDb/Api");

router.post("/list", limiter, async (req, res, next) => {
	const { filter } = decryptRes(req.body.data);
	if (!filter) next(10004);
	else {
		const { number } = filter;
		if (!number) next(10004);
		else {
			const data = await MongooseCRUD("R", "jurisprudence", { number });
			res.status(200).json({
				error_code: 0,
				data: encryptRes({
					total: data.length,
					list: data,
				}),
			});
		}
	}
});

module.exports = router;
