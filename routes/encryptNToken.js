const { MongooseCRUD } = require("../config/MongoDb/Api");
const { v4 } = require("uuid");
const CryptoJS = require("crypto-js");

const checkToken = (req, res, next) => {
  console.log("CheckToken!");

  next();
};

const makeToken = async (type) => {
  const token = v4();
  console.log("Create A TOKEN");
  const model = type === "b" ? "backend_token" : "frontend_token";
  await MongooseCRUD("C", model, { token, date: new Date() });
  return token;
};

const decryptRes = (tar) =>
  JSON.parse(CryptoJS.AES.decrypt(tar, "C8763").toString(CryptoJS.enc.Utf8));

module.exports = {
  checkToken,
  makeToken,
  decryptRes,
};
