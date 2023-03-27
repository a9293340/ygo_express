const { MongooseCRUD } = require("../config/MongoDb/Api");
const { v4 } = require("uuid");
const CryptoJS = require("crypto-js");

const checkToken = async (req, res, next) => {
  console.log("CheckToken!");
  try {
    const { tokenRef, token } = decryptRes(req.body.data);
    MongooseCRUD("R", "backend_token", { token }).then(async (arr, err) => {
      if (err || arr.length > 1) next(err || 10004);
      else if (!arr.length) next(10008);
      else {
        const checkDate =
          new Date() - new Date(arr[0]["date"]) > 60 * 60 * 1000;
        req.error_code = checkDate ? 10005 : 0;
        if (!req.error_code)
          await MongooseCRUD(
            "Uo",
            "backend_token",
            { tokenRef: tokenRef, token },
            { date: new Date() }
          );
        next();
      }
    });
  } catch (e) {
    req.error_code = 10003;
    next();
  }
};

const makeToken = async (type, removeToken, account) => {
  const token = v4();
  console.log("Create A TOKEN");
  const model = type === "b" ? "backend_token" : "frontend_token";
  if (removeToken) await MongooseCRUD("D", model, { tokenRef: account });
  let date = new Date();
  await MongooseCRUD("C", model, {
    token,
    date,
    tokenRef: account,
  });
  return {
    token,
    date,
  };
};

const decryptRes = (tar) => {
  const val = CryptoJS.AES.decrypt(tar, "C8763").toString(CryptoJS.enc.Utf8);
  try {
    return JSON.parse(val);
  } catch (e) {
    return false;
  }
};

module.exports = {
  checkToken,
  makeToken,
  decryptRes,
};
