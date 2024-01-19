const mongoose = require("mongoose");

const jurisprudence = new mongoose.Schema({
	number: { type: String },
	name_jp_h: { type: String },
	name_jp_k: { type: String },
	name_en: { type: String },
	effect_jp: { type: String },
	jud_link: { type: String },
	info: { type: String },
	qa: [
		{
			title: { type: String },
			tag: { type: String },
			date: { type: String },
			q: { type: String },
			a: { type: String },
		},
	],
});

const admin = new mongoose.Schema({
	type: { type: Number },
	name: { type: String },
	create_date: { type: Date },
	photo: { type: String },
	status: { type: Number },
	account: { type: String },
	password: { type: String },
	email: { type: String },
});

const series_introduction = new mongoose.Schema({
	type: { type: Number },
	title: { type: String },
	publish_date: { type: Date },
	photo: { type: String },
	content: { type: String },
	status: { type: Number },
	to_top: { type: Boolean },
	admin_id: { type: String },
	admin_name: { type: String },
	tag: { type: Array },
});

const useful_card_introduction = new mongoose.Schema({
	type: { type: Number },
	title: { type: String },
	publish_date: { type: Date },
	photo: { type: String },
	content: { type: String },
	status: { type: Number },
	to_top: { type: Boolean },
	admin_id: { type: String },
	admin_name: { type: String },
	tag: { type: Array },
});

const meta_deck = new mongoose.Schema({
	title: { type: String },
	publish_date: { type: Date },
	photo: { type: String },
	content: { type: String },
	status: { type: Number },
	to_top: { type: Boolean },
	admin_id: { type: String },
	admin_name: { type: String },
	tag: { type: Array },
});

const product_information = new mongoose.Schema({
	type: { type: Number },
	title: { type: String },
	publish_date: { type: Date },
	photo: { type: String },
	content: { type: String },
	status: { type: Number },
	to_top: { type: Boolean },
	admin_id: { type: String },
	admin_name: { type: String },
	tag: { type: Array },
});

const rules = new mongoose.Schema({
	type: { type: Number },
	title: { type: String },
	publish_date: { type: Date },
	photo: { type: String },
	content: { type: String },
	status: { type: Number },
	to_top: { type: Boolean },
	admin_id: { type: String },
	admin_name: { type: String },
	tag: { type: Array },
});

const series_story = new mongoose.Schema({
	title: { type: String },
	publish_date: { type: Date },
	photo: { type: String },
	content: { type: String },
	status: { type: Number },
	to_top: { type: Boolean },
	admin_id: { type: String },
	admin_name: { type: String },
	tag: { type: Array },
});

const battle_paper = new mongoose.Schema({
	type: { type: Number },
	title: { type: String },
	publish_date: { type: Date },
	photo: { type: String },
	content: { type: String },
	status: { type: Number },
	to_top: { type: Boolean },
	admin_id: { type: String },
	admin_name: { type: String },
	tag: { type: Array },
});

const cards = new mongoose.Schema({
	number: { type: String, required: true, index: true },
	name: { type: String, required: true },
	type: { type: String, required: true },
	race: { type: String },
	star: { type: String },
	attribute: { type: String, required: true },
	rarity: { type: Array, required: true },
	atk: { type: Number },
	def: { type: Number },
	product_information_type: { type: String, required: true },
	effect: { type: String, required: true },
	price_info: [
		{
			time: { type: Date, required: true },
			rarity: { type: String, required: true },
			price_lowest: { type: Number, default: null },
			price_avg: { type: Number, default: null },
		},
	],
	price_yuyu: [
		{
			time: { type: Date, required: true },
			rarity: { type: String, required: true },
			price_lowest: { type: Number, default: null },
			price_avg: { type: Number, default: null },
		},
	],
	id: { type: String, required: true, index: true },
});

const cards_image = new mongoose.Schema({
	number: { type: String },
	photo: { type: String },
});

const decks = new mongoose.Schema({
	admin_id: { type: String, required: true },
	title: { type: String, required: true, index: true },
	create_date: { type: Date, required: true },
	last_edit_date: { type: Date, default: Date.now, required: true },
	main_deck: [
		{
			card_id: { type: String, required: true },
			card_rarity: { type: String, required: true },
		},
	],
	extra_deck: [
		{
			card_id: { type: String, required: true },
			card_rarity: { type: String, required: true },
		},
	],
	side_deck: [
		{
			card_id: { type: String, required: true },
			card_rarity: { type: String, required: true },
		},
	],
});

const calendar = new mongoose.Schema({
	title: { type: String },
	date: { type: Date },
	url: { type: String },
	type: { type: Number },
	content: { type: String },
});

const banner = new mongoose.Schema({
	title: { type: String },
	subtitle: { type: String },
	date: { type: Date },
	photo_pc: { type: String },
	photo_mobile: { type: String },
	url: { type: String },
});

const product_information_type = new mongoose.Schema({
	packType: { type: String },
	mainType: { type: Number },
	status: { type: Number },
	name: { type: String },
});

const tag = new mongoose.Schema({
	tag: { type: String },
});

const frontend_token = new mongoose.Schema({
	token: { type: String },
	date: { type: Date },
	tokenReq: { type: String },
});

const backend_token = new mongoose.Schema({
	token: { type: String },
	date: { type: Date },
	tokenReq: { type: String },
});

const permission = new mongoose.Schema({
	name: { type: String },
	permission: { type: Array },
	type: { type: Number },
});

module.exports = {
	admin,
	series_introduction,
	useful_card_introduction,
	meta_deck,
	product_information,
	rules,
	series_story,
	battle_paper,
	cards,
	decks,
	calendar,
	banner,
	product_information_type,
	tag,
	frontend_token,
	backend_token,
	cards_image,
	permission,
	jurisprudence,
};
