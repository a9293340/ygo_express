const express = require("express");
const router = express.Router();
const line = require("@line/bot-sdk");
const { MongooseCRUD } = require("../../config/MongoDb/Api");
// const Jimp = require('jimp');
const sharp = require("sharp");
const axios = require("axios");
const fs = require("fs");
const { fuzzySearch } = require("../../config/tools/encryptNToken");
const OpenCC = require("opencc-js");
const cheerio = require("cheerio");
const iconv = require("iconv-lite");
const {
	reptileTargetUrl,
} = require("../../config/reptile/reptileTargetUrl.js");

const userWhiteId = ["U4a0c5ed43235ae686454440518bcbc5b"];
let joinTimestamps = {};
let groupKey = "cj/6rmp4xjp6";

const token = process.env.LINENOTIFY; // 將此替換為您的 LINE Notify 權杖
const lineNotifyURL = "https://notify-api.line.me/api/notify";

const sendLineNotify = async (message) => {
	try {
		const a = await fetch(lineNotifyURL, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body: new URLSearchParams({
				message,
			}).toString(),
		});
		// console.log(a.json());
	} catch (error) {
		console.error("Error:", error);
	}
};

const urls = (str, type) =>
	`https://www.db.yugioh-card.com/yugiohdb/card_search.action?ope=1&sess=1&rp=10&mode=&sort=1&keyword=${str}&stype=${type}&ctype=&othercon=2&starfr=&starto=&pscalefr=&pscaleto=&linkmarkerfr=&linkmarkerto=&link_m=2&atkfr=&atkto=&deffr=&defto=&request_locale=ja`;

const isChinese = (text) => /[\u4e00-\u9fff]/.test(text);

const isNotFormatFunc = (text) => /^\/[^\[lpdrsLPDRS\]]\s.*/.test(text);

const convertSimplifiedToTraditional = (text) => {
	const converter = OpenCC.Converter({ from: "cn", to: "tw", cache: true });
	return converter(text);
};

const downloadAndConvertImage = async (url, number) => {
	try {
		const response = await axios({
			url,
			responseType: "arraybuffer",
		});

		const convertedBuffer = await sharp(response.data)
			.toFormat("jpeg")
			.jpeg({ quality: 90 })
			.toBuffer();
		// console.log(convertedBuffer);
		const fileName = `./public/image/linebot/${number}.jpeg`;
		fs.writeFileSync(fileName, convertedBuffer);

		return fileName;
	} catch (error) {
		console.error("Error downloading or converting image:", error);
	}
};

const containsJapanese = (text) => {
	const japaneseRegex =
		/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\u3400-\u4DBF]/;
	return japaneseRegex.test(text);
};

const getJudRulesLink = async (text) => {
	// console.log(text);
	const type = containsJapanese(text) ? 1 : 4;
	const tar = containsJapanese(text) ? encodeURIComponent(text) : text;
	const url = urls(tar, type);
	// console.log(url);
	const res = await reptileTargetUrl(url);
	const body = iconv.decode(Buffer.from(res), "UTF-8");
	const $ = cheerio.load(body);

	const lens = $("#card_list").children(".t_row.c_normal").length;

	if (lens === 1)
		return `https://www.db.yugioh-card.com${$(".link_value").attr("value")}`;
	else if (lens === 0) return "";
	else {
		let box = [];
		$("#card_list")
			.children(".t_row.c_normal")
			.children(".flex_1")
			.children(".box_card_name.flex_1.top_set")
			.children(".card_name")
			.each((n, card) => {
				box.push($(card).text());
			});
		return box;
	}
};

const generateRandomString = (length) => {
	const characters =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^";
	let result = "";
	const charactersLength = characters.length;
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
};

const config = {
	channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
	channelSecret: process.env.CHANNEL_SECRET,
};

const client = new line.Client(config);

router.post("/", (req, res) => {
	Promise.all(req.body.events.map(handleEvent))
		.then((result) => res.json(result))
		.catch((err) => {
			console.error("Error occurred:", err);
			res.status(500).end();
		});
});

async function handleEvent(event) {
	const groupId = event.source.groupId;

	// 個人用戶只允許白名單
	if (event.source.type === "user") {
		if (!userWhiteId.find((el) => el === event.source.userId))
			return Promise.resolve(null);
	}

	// 群組需要在時限內輸入密鑰否則退出
	if (event.type === "join" && event.source.type === "group") {
		joinTimestamps[groupId] = Date.now();

		// 設置五秒後檢查
		setTimeout(async () => {
			if (Date.now() - joinTimestamps[groupId] >= 10000) {
				// 如果五秒後仍在joinTimestamps中，則離開群組
				await client.leaveGroup(groupId);
				delete joinTimestamps[groupId];
			}
		}, 10000);

		return client.replyMessage(event.replyToken, [
			{ type: "text", text: "請於10秒鐘輸入通行令" },
		]);
	}

	if (event.type !== "message" || event.message.type !== "text") {
		return Promise.resolve(null);
	}

	if (event.type === "message" && event.source.type === "group") {
		if (joinTimestamps[groupId] && event.message.text === groupKey) {
			delete joinTimestamps[groupId];

			let replyText = `解除限制，歡迎使用CardTime Line bot \n`;
			replyText += `此line bot屬於CardTime所有\n`;
			replyText += `請輸入 /功能 來看看我有啥能力吧~\n`;
			replyText += `歡迎造訪CardTime網頁 : https://cardtime.tw \n`;
			groupKey = generateRandomString(16);
			console.log(groupKey);
			await sendLineNotify(`密鑰變更為 : ${groupKey}`);
			return client.replyMessage(event.replyToken, [
				{ type: "text", text: replyText },
			]);
		}
	}

	let replyText = "";
	let img;
	const search = event.message.text.toLowerCase().startsWith("/s ");
	const price = event.message.text.toLowerCase().startsWith("/p ");
	const deck = event.message.text.toLowerCase().startsWith("/d ");
	const list = event.message.text.toLowerCase().startsWith("/l ");
	const rules = event.message.text.toLowerCase().startsWith("/r ");
	const functions = event.message.text.toLowerCase().startsWith("/功能");
	if (search || price) {
		const tarText = event.message.text.substr(3);
		// console.log(tarText);
		let filter;
		let jud = "";
		// 卡片密碼
		if (Number.isInteger(parseInt(tarText)) && search) {
			filter = {
				number: tarText,
			};
			jud = "n";
			// 中文
		} else if (
			(isChinese(tarText) || tarText.split(" ").length > 0) &&
			search
		) {
			const tranChi = convertSimplifiedToTraditional(tarText);
			// console.log(tranChi);
			filter = {
				name: tranChi,
			};
			jud = "c";
			// 卡號
		} else
			filter = {
				id: tarText,
			};
		const cardId = await MongooseCRUD("R", "cards", filter);
		if (cardId.length) {
			const card = cardId[0];
			const url = `https://cardtime.tw/api/card-image/cards/${card.number}.webp`;
			await downloadAndConvertImage(url, card.number);
			const jpg = `https://cardtime.tw/api/card-image/linebot/${card.number}.jpeg`;
			// console.log(jpg);
			img = {
				type: "image",
				originalContentUrl: jpg,
				previewImageUrl: jpg,
			};
			if (search) {
				replyText += `卡片名稱 : ${card.name}\n`;
				replyText += `攻擊/守備 : ${card.atk >= 0 ? card.atk : "-"}/${
					card.def >= 0 ? card.def : "-"
				}\n`;
				replyText += `屬性 : ${card.attribute} / 種族 : ${
					card.race ? card.race : "-"
				} / 等級 : ${card.star ? card.star : "-"}\n`;
				replyText += `類別 : ${card.type}\n`;
				replyText += `效果 : ${card.effect}\n`;
				if (!jud) replyText += `版本 : ${card.rarity.join(",")}\n`;
			} else {
				const rLens = card.rarity.length;
				const prices = card.price_info.slice(-rLens);
				const priceText = prices.map(
					(el) =>
						`版本 : ${el.rarity} / 均價 : ${el.price_avg} / 最低價 : ${el.price_lowest}\n`
				);
				replyText += `卡片名稱 : ${card.name}\n`;
				replyText += `卡價時間 : ${prices[0].time}\n`;
				replyText += `卡價 :\n`;

				for (let i = 0; i < priceText.length; i++) {
					const pt = priceText[i];
					replyText += `${pt}`;
				}
			}
		} else {
			if (isChinese(tarText)) {
				replyText += `查無此卡(${tarText})，可依照下述方式取得資訊 :\n`;
				replyText += `1. /l ${tarText} 取得所有相關卡片名稱列表\n`;
				replyText += `2. /s 目標 取得目標卡牌資訊\n`;
			} else replyText = "無此卡片";
		}
	} else if (deck) {
		const decks = await MongooseCRUD("R", "decks", {
			title: fuzzySearch(event.message.text.substr(3)),
		});
		if (decks.length) {
			for (let i = 0; i < decks.length; i++) {
				const deckInfo = decks[i];
				replyText += `牌組名稱 : ${deckInfo.title}\nhttps://cardtime.tw/deck/${deckInfo._id}\n`;
			}
		} else replyText += "查無此字段的相關牌組";
	} else if (list) {
		const lists = [
			...new Set(
				(
					await MongooseCRUD("R", "cards", {
						name: fuzzySearch(event.message.text.toUpperCase().split("/L ")[1]),
					})
				).map((el) => el.name)
			),
		];
		if (lists.length) {
			replyText += `相關卡片條列如下 : \n`;
			for (let i = 0; i < lists.length; i++) {
				const item = lists[i];
				replyText += `${item} \n`;
			}
		} else
			replyText =
				"無此字段相關的卡片，可能翻譯問題(Ex: 如光道/光之領主)，請嘗試其他譯名";
	} else if (rules) {
		const tarText = event.message.text.substr(3);
		console.log(tarText);
		const url = await getJudRulesLink(tarText);
		if (Array.isArray(url)) {
			replyText += `${tarText} 相關系列卡日文如下 :\n`;
			for (let i = 0; i < url.length; i++) {
				const card = url[i];
				replyText += `${card} \n`;
			}
			replyText += "請則依搜索該卡Q&A";
		} else if (url) {
			replyText += `${tarText} 判例連結如下 :\n`;
			replyText += url;
		} else replyText += "找不到此卡，請輸入日文";
	} else if (functions || isNotFormatFunc(event.message.text)) {
		replyText += `功能列表 (不分大小寫)\n\n`;
		replyText += `搜尋效果及卡片詳情 :\n`;
		replyText += `/s + 卡號/卡片密碼/名稱\n\n`;
		replyText += `搜尋相關卡片名稱(模糊搜尋)(條列) :\n`;
		replyText += `/l + 卡片名稱\n\n`;
		replyText += `搜尋卡價 :\n`;
		replyText += `/p + 卡號\n\n`;
		replyText += `搜尋牌組(模糊搜尋)(條列) :\n`;
		replyText += `/d + 牌組名稱\n\n`;
		replyText += `搜尋卡片QA (卡名需用日文) :\n`;
		replyText += `/r + 日文卡名/卡號 `;
	}

	// 處理空消息或未知命令的情況
	if (replyText === "") {
		return Promise.resolve(null);
	}

	// console.log(`Replying with message: ${replyText}`);
	let msg = [{ type: "text", text: replyText }];
	if (img) msg.push(img);
	// console.log(msg);
	return client.replyMessage(event.replyToken, msg);
}

module.exports = router;
