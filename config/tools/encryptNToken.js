const { MongooseCRUD } = require("../MongoDb/Api");
const { v4 } = require("uuid");
const CryptoJS = require("crypto-js");
const frontend = require("../db/frontend.json");

const checkFrontEndPath = (req) => {
	const check = frontend[req.path.replace("/", "")];
	// console.log(
	// 	check,
	// 	req.baseUrl,
	// 	check.find((el) => req.baseUrl.indexOf(el) !== -1)
	// );
	return check ? !!check.find((el) => req.baseUrl.indexOf(el) !== -1) : false;
};

const checkToken = async (req, res, next) => {
	console.log("CheckToken!");
	try {
		const { tokenReq, token } = decryptRes(req.body.data);
		// console.log("!!!", tokenReq, token, checkFrontEndPath(req));
		// 部分邏輯前台無需檢查token
		if (token === "frontend" && checkFrontEndPath(req)) next();
		// 非合格路徑則回傳無權限
		else if (token === "frontend") next(10008);
		else {
			if (typeof tokenReq !== "string" || typeof token !== "string")
				next(10003);
			else {
				// console.log("pass");
				const jud =
					req.path.indexOf("/deck/") !== -1
						? "frontend_token"
						: "backend_token";
				MongooseCRUD("R", jud, { token }).then(async (arr, err) => {
					// console.log(arr);
					if (err || arr.length > 1) next(err || 10004);
					else if (!arr.length) next(10005);
					else {
						const checkDate =
							new Date() - new Date(arr[0]["date"]) >
							60 * 60 * 1000 * (jud === "frontend_token" ? 72 : 6);
						req.error_code = checkDate ? 10005 : 0;
						if (!req.error_code) {
							await MongooseCRUD(
								"Uo",
								jud,
								{ tokenReq, token },
								{ date: new Date() }
							);
							next();
						} else next(req.error_code);
					}
				});
			}
		}
	} catch (e) {
		console.log(e);
		req.error_code = 10003;
		next(10003);
	}
};

const makeToken = async (type, removeToken, account) => {
	const token = v4();
	console.log("Create A TOKEN");
	const model = type === "b" ? "backend_token" : "frontend_token";
	if (removeToken) await MongooseCRUD("D", model, { tokenReq: account });
	let date = new Date();
	await MongooseCRUD("C", model, {
		token,
		date,
		tokenReq: account,
	});
	return encryptRes({
		token,
		date,
	});
};

const decryptRes = (tar) => {
	try {
		const val = CryptoJS.AES.decrypt(tar, "C8763").toString(CryptoJS.enc.Utf8);
		return JSON.parse(val);
	} catch (e) {
		return false;
	}
};

const encryptRes = (tar) =>
	CryptoJS.AES.encrypt(JSON.stringify(tar), "C8763").toString();

const fuzzySearch = (str) => new RegExp(`.*${str}.*`, "i");

module.exports = {
	checkToken,
	makeToken,
	decryptRes,
	encryptRes,
	fuzzySearch,
};
