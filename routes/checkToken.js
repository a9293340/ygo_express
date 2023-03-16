const { MongooseCRUD } = require("../config/MongoDb/Api");

const checkToken = (req, res, next) => {
  console.log("CheckToken!");
  next();
};

module.exports = checkToken;
