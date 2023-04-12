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
	hasPage = false
) => {
	MongooseCRUD('R', modelName, target, {}, {}).then((arr, err) => {
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
			res.status(200).json({
				error_code: 0,
				data: encryptRes(
					hasPage
						? {
								total: arr.length,
								list: arr.slice(
									hasPage.page * hasPage.limit,
									(hasPage.page + 1) * hasPage.limit
								),
						  }
						: {
								list: arr,
						  }
				),
			});
		}
	});
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
	let arr = await MongooseCRUD('Uo', modelName, { _id }, use);
	res.status(200).json({
		error_code: !arr['matchedCount'] ? 10007 : 0,
		data: encryptRes({}),
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
};
