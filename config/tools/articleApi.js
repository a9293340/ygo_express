// const { MongooseCRUD } = require('../../config/MongoDb/Api');
const { decryptRes } = require('./encryptNToken');
const { pList, pAdd, pEdit } = require('./postAction');
const { toISODate } = require('./toDate');

const articleList = (req, res, next, modelName) => {
	const { token, filter, limit, page } = decryptRes(req.body.data);
	let target =
		token === 'frontend'
			? filter
			: {
					publish_date: {
						$gte: toISODate(filter.begin_date),
						$lte: toISODate(filter.end_date),
					},
					status: filter.status,
			  };
	let projection =
		token === 'frontend' && filter._id
			? {}
			: {
					content: 0,
			  };
	// console.log(projection);
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
