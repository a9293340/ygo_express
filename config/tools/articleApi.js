// const { MongooseCRUD } = require('../../config/MongoDb/Api');
const { decryptRes, fuzzySearch } = require('./encryptNToken');
const { pList, pAdd, pEdit } = require('./postAction');
const { toISODate } = require('./toDate');
const { makeImage } = require('./makeImage');
const { MongooseCRUD } = require('../MongoDb/Api');
const fs = require('fs');

const articleList = (req, res, next, modelName) => {
  const { token, filter, limit, page } = decryptRes(req.body.data);
  const getBackendTarget = () => {
    let tar = {};
    if (Number.isInteger(filter.status)) tar.status = filter.status;
    if (Number.isInteger(filter.type)) tar.type = filter.type;
    if (filter.title) tar.title = fuzzySearch(filter.title);
    if (filter.content) tar.content = fuzzySearch(filter.content);
    if (filter._id) tar._id = filter._id;
    if (filter.begin_date && filter.end_date) {
      tar.publish_date = {
        $gte: toISODate(filter.begin_date),
        $lte: toISODate(filter.end_date),
      };
    }

    return tar;
  };
  let target = token === 'frontend' ? filter : getBackendTarget();
  const projection =
    limit !== 1
      ? {
          content: 0,
        }
      : {};
  pList(
    res,
    next,
    modelName,
    target,
    true,
    {
      limit,
      page,
    },
    projection,
  );
};

const articleCreate = (req, res, next, modelName) => {
  let { token, tokenReq, ...use } = decryptRes(req.body.data);
  use.publish_date = toISODate(use.publish_date);
  use.status = 1;
  use.to_top = false;
  if (use.photo) use.photo = makeImage(photo, 'article');

  pAdd(res, next, modelName, use);
};

const articleEdit = async (req, res, next, modelName) => {
  let { token, tokenReq, _id, ...use } = decryptRes(req.body.data);
  if (!_id) next(10004);
  else {
    try {
      use.publish_date = toISODate(use.publish_date);
      try {
        const lastDatabase = (await MongooseCRUD('R', modelName, { _id: use._id }))[0];
        if (lastDatabase && lastDatabase.photo) {
          fs.unlinkSync(`./public/image/article/${lastDatabase.photo}.webp`);
        }
      } catch (error) {
        console.log('Remove file error!');
      }
      if (use.photo) use.photo = makeImage(photo, 'article');
      pEdit(res, next, modelName, use, _id);
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
