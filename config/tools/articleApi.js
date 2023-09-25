// const { MongooseCRUD } = require('../../config/MongoDb/Api');
const { decryptRes } = require("./encryptNToken");
const { pList, pAdd, pEdit } = require("./postAction");
const { toISODate } = require("./toDate");

const articleList = (req, res, next, modelName) => {
	const { token, filter, limit, page } = decryptRes(req.body.data);
	const getBackendTarget = () => {
		let tar = {};
		if (Number.isInteger(filter.status)) tar.status = filter.status;
		if (Number.isInteger(filter.type)) tar.type = filter.type;
		if (filter._id) tar._id = filter._id;
		if (filter.begin_date && filter.end_date) {
			tar.publish_date = {
				$gte: toISODate(filter.begin_date),
				$lte: toISODate(filter.end_date),
			};
		}

		return tar;
	};
	let target = token === "frontend" ? filter : getBackendTarget();
	const projection =
		limit !== 1
			? {
					content: 0,
			  }
			: {};
	pList(
		res,
		next,
		modelName,
		target,
		true,
		{
			limit,
			page,
		},
		projection
	);
};

const articleCreate = (req, res, next, modelName) => {
	const { token, tokenReq, ...use } = decryptRes(req.body.data);
	use.publish_date = toISODate(use.publish_date);
	use.status = 1;
	use.to_top = false;
	pAdd(res, next, modelName, use);
};

const articleEdit = async (req, res, next, modelName) => {
	const { token, tokenReq, _id, ...use } = decryptRes(req.body.data);
	if (!_id) next(10004);
	else {
		try {
			pEdit(res, next, modelName, use, _id);
		} catch (e) {
			next(10003);
		}
	}
};

module.exports = {
	articleList,
	articleCreate,
	articleEdit,
};
