const rateLimiter = require("express-rate-limit");

const limiter = rateLimiter({
  max: 3,
  windowMS: 10000, // 10 seconds
  message: "You can't make any more requests at the moment. Try again later",
});

module.exports = {
  limiter,
};
