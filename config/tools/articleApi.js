const { MongooseCRUD } = require("../../config/MongoDb/Api");
const { decryptRes, encryptRes } = require("./encryptNToken");
const { toISODate, makeArticleDateArr } = require("./toDate");
const articleList = (req, res, next, modelName) => {
  const { token, filter, limit, page } = decryptRes(req.body.data);
  let target =
    token === "frontend"
      ? filter
      : {
          publish_date: {
            $gte: toISODate(filter.begin_date),
            $lte: toISODate(filter.end_date),
          },
          status: filter.status,
        };
  MongooseCRUD("R", modelName, target, {}, {}).then((arr, err) => {
    if (err) next(err);
    else if (!Number.isInteger(limit) || !Number.isInteger(page)) next(10004);
    else {
      arr = makeArticleDateArr(arr);
      res.status(200).json({
        error_code: 0,
        data: encryptRes({
          total: arr.length,
          list: arr.slice(page * limit, (page + 1) * limit),
        }),
      });
    }
  });
};

const articleCreate = (req, res, next, modelName) => {
  const { token, tokenReq, ...use } = decryptRes(req.body.data);
  use.last_edit_date = use.publish_date;
  use.status = 1;
  use.to_top = false;
  MongooseCRUD("C", modelName, use).then((arr, err) => {
    if (err) next(err);
    else {
      res.status(200).json({
        error_code: 0,
        data: encryptRes({}),
      });
    }
  });
};

const articleEdit = async (req, res, next, modelName) => {
  const { token, tokenReq, _id, ...use } = decryptRes(req.body.data);
  if (!_id) next(10004);
  else {
    try {
      let arr = await MongooseCRUD("Uo", modelName, { _id }, use);
      res.status(200).json({
        error_code: !arr["matchedCount"] ? 10007 : 0,
        data: encryptRes({}),
      });
    } catch (e) {
      next(10003);
    }
  }
};

module.exports = {
  articleList,
  articleCreate,
  articleEdit,
};
