const permissionRouterTable = [
	'member',
	'banner',
	'series_introduction',
	'useful_card_introduction',
	'meta_deck',
	'production_information',
	'rules',
	'series_story',
	'battle_paper',
	'calendar',
	'deck',
	'cards',
	'tag',
	'pack_type',
	'permit',
];

const makePermission = (permit) =>
	Object.keys(permit).filter((per) => permit[per]);

const parsingPermission2Obj = (arr) => {
	let target = {};
	permissionRouterTable.forEach((per) => {
		target[per] = !!arr.find((el) => el === per);
	});

	return target;
};

module.exports = {
	makePermission,
	parsingPermission2Obj,
};
