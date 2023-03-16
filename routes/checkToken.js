const checkToken = (req, res, next) => {
  console.log("CheckToken!");
  next();
};

module.exports = checkToken;
