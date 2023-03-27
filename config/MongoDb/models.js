const mongoose = require("mongoose");

const admin = new mongoose.Schema({
  type: { type: Number },
  name: { type: "string" },
  create_date: { type: "string" },
  photo: { type: "string" },
  status: { type: Number },
  account: { type: "string" },
  password: { type: "string" },
  email: { type: "string" },
});

const series_introduction = new mongoose.Schema({
  type: { type: Number },
  title: { type: String },
  publish_date: { type: String },
  last_edit_date: { type: String },
  photo: { type: String },
  content: { type: String },
  status: { type: Number },
  to_top: { type: Boolean },
  admin_id: { type: Number },
  tag: { type: Array },
});

const useful_card_introduction = new mongoose.Schema({
  type: { type: Number },
  title: { type: String },
  publish_date: { type: String },
  last_edit_date: { type: String },
  photo: { type: String },
  content: { type: String },
  status: { type: Number },
  to_top: { type: Boolean },
  admin_id: { type: Number },
  tag: { type: Array },
});

const meta_deck = new mongoose.Schema({
  type: { type: Number },
  title: { type: String },
  publish_date: { type: String },
  last_edit_date: { type: String },
  photo: { type: String },
  content: { type: String },
  status: { type: Number },
  to_top: { type: Boolean },
  admin_id: { type: Number },
  tag: { type: Array },
});

const product_information = new mongoose.Schema({
  type: { type: Number },
  product_information_type_id: { type: Number },
  title: { type: String },
  publish_date: { type: String },
  last_edit_date: { type: String },
  photo: { type: String },
  content: { type: String },
  status: { type: Number },
  to_top: { type: Boolean },
  admin_id: { type: Number },
  tag: { type: Array },
});

const rules = new mongoose.Schema({
  type: { type: Number },
  title: { type: String },
  publish_date: { type: String },
  last_edit_date: { type: String },
  photo: { type: String },
  content: { type: String },
  status: { type: Number },
  to_top: { type: Boolean },
  admin_id: { type: Number },
  tag: { type: Array },
});

const series_story = new mongoose.Schema({
  title: { type: String },
  publish_date: { type: String },
  last_edit_date: { type: String },
  photo: { type: String },
  content: { type: String },
  status: { type: Number },
  to_top: { type: Boolean },
  admin_id: { type: Number },
  tag: { type: Array },
});

const battle_paper = new mongoose.Schema({
  type: { type: Number },
  title: { type: String },
  publish_date: { type: String },
  last_edit_date: { type: String },
  photo: { type: String },
  content: { type: String },
  status: { type: Number },
  to_top: { type: Boolean },
  admin_id: { type: Number },
  tag: { type: Array },
});

const cards = new mongoose.Schema({
  number: { type: String },
  name: { type: String },
  type: { type: String },
  star: { type: String },
  attribute: { type: String },
  rarity: { type: Array },
  atk: { type: Number },
  def: { type: Number },
  product_information_type_id: { type: Number },
  effect: { type: String },
  photo: { type: String },
  price_info: { type: Array },
});

const decks = new mongoose.Schema({
  admin_id: { type: Number },
  title: { type: String },
  create_date: { type: String },
  last_edit_date: { type: String },
  main_deck: { type: Array },
  extra_deck: { type: Array },
  side_deck: { type: Array },
});

const calendar = new mongoose.Schema({
  title: { type: String },
  date: { type: String },
  url: { type: String },
  type: { type: Number },
});

const banner = new mongoose.Schema({
  title: { type: String },
  subtitle: { type: String },
  date: { type: String },
  photo_pc: { type: String },
  photo_mobile: { type: String },
  url: { type: String },
});

const product_information_type = new mongoose.Schema({
  packType: { type: String },
  subtype: { type: String },
  maintype: { type: Number },
  status: { type: Number },
  name: { type: String },
});

const tag = new mongoose.Schema({
  tag: { type: String },
});

const frontend_token = new mongoose.Schema({
  token: { type: String },
  date: { type: String },
  tokenRef: { type: String },
});

const backend_token = new mongoose.Schema({
  token: { type: String },
  date: { type: String },
  tokenRef: { type: String },
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
};
