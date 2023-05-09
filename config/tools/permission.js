const permissionRouterTable = [
	'member',
	'member_add',
	'member_edit',
	'banner',
	'banner_add',
	'banner_edit',
	'series_introduction',
	'series_introduction_add',
	'series_introduction_edit',
	'useful_card_introduction',
	'useful_card_introduction_add',
	'useful_card_introduction_edit',
	'meta_deck',
	'meta_deck_add',
	'meta_deck_edit',
	'production_information',
	'production_information_add',
	'production_information_edit',
	'rules',
	'rules_add',
	'rules_edit',
	'series_story',
	'series_story_add',
	'series_story_edit',
	'battle_paper',
	'battle_paper_add',
	'battle_paper_edit',
	'calendar',
	'calendar_add',
	'calendar_edit',
	'deck',
	'deck_add',
	'deck_edit',
	'cards',
	'cards_add',
	'cards_edit',
	'tag',
	'tag_add',
	'tag_edit',
	'pack_type',
	'pack_type_add',
	'pack_type_edit',
	'permit',
	'permit_add',
	'permit_edit',
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
