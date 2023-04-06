const toDateString = (date) => {
  const time = new Date(date);
  return `${time.getFullYear()}-${
    time.getMonth() + 1
  }-${time.getDate()} ${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`;
};

const toISODate = (str) => new Date(str);

const makeArticleDateArr = (arr) =>
  arr.map((el) => {
    let a = JSON.parse(JSON.stringify(el));
    a.publish_date = toDateString(el.publish_date);
    return a;
  });

module.exports = {
  toISODate,
  toDateString,
  makeArticleDateArr,
};
