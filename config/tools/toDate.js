const dayjs = require("dayjs");

const toDateString = (date) => dayjs(date).format("YYYY-MM-DD HH:mm:ss");

const toISODate = (str) => new Date(str);

const makeArticleDateArr = (arr) =>
	arr.map((el) => {
		let a = JSON.parse(JSON.stringify(el));
		if (Object.keys(a).find((s) => s === "create_date"))
			a.create_date = toDateString(el.create_date);
		if (Object.keys(a).find((s) => s === "publish_date"))
			a.publish_date = toDateString(el.publish_date);
		if (Object.keys(a).find((s) => s === "date"))
			a.date = toDateString(el.date);
		return a;
	});

module.exports = {
	toISODate,
	toDateString,
	makeArticleDateArr,
};
