const { MongooseCRUD } = require('../../config/MongoDb/Api');
const { encryptRes } = require('./encryptNToken');
const { parsingPermission2Obj, makePermission } = require('./permission');
const { makeArticleDateArr } = require('./toDate');

const pList = (
	res,
	next,
	modelName,
	target,
	hasDateFormat = false,
	hasPage = false,
	projection = {}
) => {
	const option = hasPage
		? {
				limit: hasPage.limit,
				skip: hasPage.page * hasPage.limit,
		  }
		: {};
	MongooseCRUD('R', modelName, target, option, projection).then(
		async (arr, err) => {
			if (err) next(err);
			else if (
				hasPage &&
				(!Number.isInteger(hasPage.limit) ||
					!Number.isInteger(hasPage.page))
			) {
				next(10004);
			} else {
				if (hasDateFormat) arr = makeArticleDateArr(arr);
				// permission 需轉換成object格式
				else if (modelName === 'permission') {
					for (let i = 0; i < arr.length; i++) {
						arr[i].permission = parsingPermission2Obj(
							arr[i].permission
						);
					}
				}
				const count = hasPage
					? await MongooseCRUD('COUNT', modelName, target)
					: 0;
				res.status(200).json({
					error_code: 0,
					data: encryptRes(
						hasPage
							? {
									total: count,
									list: arr,
							  }
							: {
									list: arr,
							  }
					),
				});
			}
		}
	);
};

const pAdd = (res, next, modelName, use) => {
	MongooseCRUD('C', modelName, use).then((arr, err) => {
		if (err) next(err);
		else {
			res.status(200).json({
				error_code: 0,
				data: encryptRes({}),
			});
		}
	});
};

const pEdit = async (res, next, modelName, use, _id) => {
	if (modelName === 'permission')
		use.permission = makePermission(use.permission);
	try {
		let arr = await MongooseCRUD('Uo', modelName, { _id }, use);
		res.status(200).json({
			error_code: !arr['matchedCount'] ? 10007 : 0,
			data: encryptRes({}),
		});
	} catch (error) {
		next(10003);
	}
};

const pAggregate = async (res, modelName, target, hasPage) => {
	MongooseCRUD('A', modelName, target, {}, {}).then(async (arr, err) => {
		if (err) next(err);
		else if (
			hasPage &&
			(!Number.isInteger(hasPage.limit) ||
				!Number.isInteger(hasPage.page))
		) {
			next(10004);
		} else {
			let lastFilter = target.filter(
				(el) =>
					Object.keys(el)[0] === '$match' ||
					Object.keys(el)[0] === '$search'
			);
			// Add Count
			lastFilter.push({
				$count: 'count',
			});
			const total = (await MongooseCRUD('A', modelName, lastFilter))[0]
				.count;
			res.status(200).json({
				error_code: 0,
				data: encryptRes({
					total,
					list: arr,
				}),
			});
		}
	});
};

const canNotBeSameBeforeAdd = async (
	res,
	next,
	modelName,
	useful,
	checkKey
) => {
	if (!useful[checkKey]) next(10004);
	else {
		let obj = {};
		obj[checkKey] = useful[checkKey];
		const arr = await MongooseCRUD('R', modelName, obj);
		if (arr.length) next(10012);
		else pAdd(res, next, modelName, useful);
	}
};

module.exports = {
	pList,
	pAdd,
	pEdit,
	canNotBeSameBeforeAdd,
	pAggregate,
};