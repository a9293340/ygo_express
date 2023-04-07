const { MongooseCRUD } = require("../MongoDb/Api");
const { v4 } = require("uuid");
const CryptoJS = require("crypto-js");

const checkToken = async (req, res, next) => {
  console.log("CheckToken!");
  try {
    const { tokenReq, token } = decryptRes(req.body.data);
    MongooseCRUD("R", "backend_token", { token }).then(async (arr, err) => {
      if (err || arr.length > 1) next(err || 10004);
      else if (!arr.length) next(10008);
      else {
        const checkDate =
          new Date() - new Date(arr[0]["date"]) > 60 * 60 * 1000;
        req.error_code = checkDate ? 10005 : 0;
        if (!req.error_code) {
          await MongooseCRUD(
            "Uo",
            "backend_token",
            { tokenReq, token },
            { date: new Date() }
          );
          next();
        } else next(req.error_code);
      }
    });
  } catch (e) {
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
  const val = CryptoJS.AES.decrypt(tar, "C8763").toString(CryptoJS.enc.Utf8);
  try {
    return JSON.parse(val);
  } catch (e) {
    return false;
  }
};

const encryptRes = (tar) =>
  CryptoJS.AES.encrypt(JSON.stringify(tar), "C8763").toString();

module.exports = {
  checkToken,
  makeToken,
  decryptRes,
  encryptRes,
};