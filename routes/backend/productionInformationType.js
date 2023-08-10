const express = require('express');
const router = express.Router();

const { checkToken, encryptRes } = require('../../config/tools/encryptNToken');
const { limiter } = require('../../config/tools/rate-limiter');
const { MongooseCRUD } = require('../../config/MongoDb/Api');

router.post('/list', limiter, checkToken, async (req, res, next) => {
	MongooseCRUD('R', 'product_information_type', {}).then((arr, err) => {
		if (err) next(err);
		else
			res.status(200).json({
				error_code: 0,
				data: encryptRes({
					productionInformation_subType: arr.map((el) => el.subType),
				}),
			});
	});
});

module.exports = router;
