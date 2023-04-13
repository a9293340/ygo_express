const { reptileTargetUrl } = require('./reptileTargetUrl');
const { delay } = require('../tools/delay');
const iconv = require('iconv-lite');
const cheerio = require('cheerio');

const transfer = [
	{
		from: ['N'],
		to: ['普卡', '點鑽', '碎鑽', '方鑽'],
	},
	{
		from: ['R'],
		to: ['銀字', '銀字點鑽', '銀字碎鑽', '銀字方鑽'],
	},
	{
		from: ['NR'],
		to: ['隱普'],
	},
	{
		from: ['SR'],
		to: ['亮面', '亮面點鑽', '亮面碎鑽', '亮面方鑽'],
	},
	{
		from: ['UL'],
		to: ['金普'],
	},
	{
		from: ['UR'],
		to: ['金亮', '紅亮', '藍亮', '金亮點鑽', '金亮碎鑽', '金亮方鑽'],
	},
	{
		from: ['SE', 'GSE'],
		to: [
			'半鑽',
			'紅字半鑽',
			'藍鑽',
			'半鑽點鑽',
			'半鑽碎鑽',
			'半鑽方鑽',
			'斜鑽',
		],
	},
	{
		from: ['EXSE', 'P-EXSE'],
		to: ['斜鑽'],
	},
	{
		from: ['P-R'],
		to: ['銀鑽'],
	},
	{
		from: ['PSE'],
		to: ['白鑽'],
	},
	{
		from: ['P-UR'],
		to: ['全鑽'],
	},
	{
		from: ['CR'],
		to: ['雕鑽'],
	},
	{
		from: ['UL'],
		to: ['浮雕'],
	},
	{
		from: ['HR', 'P-HR'],
		to: ['雷射'],
	},
	{
		from: ['GR'],
		to: ['黃金'],
	},
	{
		from: ['20thSE', '10000SE'],
		to: ['紅鑽'],
	},
	{
		from: ['QCSE'],
		to: ['金鑽'],
	},
	{
		from: ['KC-UR'],
		to: ['KC紋'],
	},
	{
		from: ['M', 'M-SR', 'M-UR', 'M-GR', 'M-SE'],
		to: ['古文鑽'],
	},
	{
		from: ['P-N', 'P-SR', 'P-UR'],
		to: ['普鑽', '粉鑽', '亮面彩鑽', '金亮彩鑽', '半鑽彩鑽', '碎鑽'],
	},
	{
		from: ['KC-R'],
		to: ['銀字KC紋'],
	},
];

const getPriceYuYu = async (name, rares) => {
	let targetPrice = 0;
	// await delay(Math.random() * 300);
	try {
		const URL =
			'https://yuyu-tei.jp/game_ygo/sell/sell_price.php?name=' + name;
		const url = await reptileTargetUrl(URL);
		const body = iconv.decode(Buffer.from(url), 'UTF-8');
		const $ = cheerio.load(body);
		const checkRares =
			rares.indexOf('異圖') !== -1 ? rares.split('-')[1] : rares;
		const isDiff = rares.indexOf('異圖') !== -1;
		const checkRare = (from, to) =>
			transfer.findIndex(
				(el) =>
					el.from.findIndex((x) => x === from) !== -1 &&
					el.to.findIndex((x) => x === to) !== -1
			) !== -1;

		const str2Int = (tar) =>
			tar
				.text()
				.replace(/[^\d.-]/g, ' ')
				.split(' ')
				.filter((el) => el)
				.map((el) => parseInt(el));
		const checkDiff = (imgArr) =>
			isDiff
				? imgArr.findIndex((x) => x.indexOf('違い版') !== -1)
				: imgArr.findIndex((x) => x.indexOf('違い版') === -1);

		$('.gr_color').each((n, color) => {
			if (checkRare($(color).text(), checkRares)) {
				let imgArr = [];
				const priceWords = $(
					`.card_unit.rarity_${$(
						color
					).text()} > .price_box > form > .price > b`
				);
				const targetArr = str2Int(priceWords);
				$(`.card_unit.rarity_${$(color).text()} > .image_box`).each(
					(ss, set) => {
						imgArr.push($(set).children('p.name').text());
					}
				);
				targetPrice =
					targetArr.length === 1
						? targetArr[0]
						: targetArr[checkDiff(imgArr)];
			}
		});
	} catch (e) {
		console.log(e);
		console.log('aa');
	}
	console.log(targetPrice);
	return targetPrice;
};

module.exports = {
	getPriceYuYu,
};
