const { MongooseCRUD } = require('../../config/MongoDb/Api');
const { encryptRes } = require('./encryptNToken');
const { makeAuthorName } = require('./makeAutorName');
const { parsingPermission2Obj, makePermission } = require('./permission');
const { makeArticleDateArr } = require('./toDate');

const pList = (
  res,
  next,
  modelName,
  target,
  hasDateFormat = false,
  hasPage = false,
  projection = {},
) => {
  const hasLimitPage = hasPage && Number.isInteger(hasPage.limit) && Number.isInteger(hasPage.page);
  let option = hasLimitPage
    ? {
        limit: hasPage.limit,
        skip: hasPage.page * hasPage.limit,
      }
    : {};
  if (hasDateFormat) {
    const keys = Object.keys(target);
    let key = '';
    if (keys.find(el => el === 'date')) key = 'date';
    else if (keys.find(el => el === 'publish_date')) key = 'publish_date';
    else if (keys.find(el => el === 'create_date')) key = 'create_date';
    // banner
    else if (!keys.length) key = 'date';
    if (key !== '') {
      option.sort = {};
      option.sort[key] = -1;
    }
  }
  console.log(option);
  // console.log(modelName, target, option);
  MongooseCRUD('R', modelName, target, option, projection).then(async (arr, err) => {
    console.log(arr);
    if (err) next(err);
    if (!arr.length)
      res.status(200).json({
        error_code: 0,
        data: encryptRes(
          hasPage
            ? {
                total: 0,
                list: arr,
              }
            : {
                list: arr,
              },
        ),
      });
    else if (
      hasLimitPage &&
      (!Number.isInteger(hasPage.limit) || !Number.isInteger(hasPage.page))
    ) {
      next(10004);
    } else {
      // 轉換日期
      if (hasDateFormat) arr = makeArticleDateArr(arr);
      // 文章新增author_name
      if (arr[0]['admin_id'] && modelName !== 'decks') arr = await makeAuthorName(arr);
      // permission 需轉換成object格式
      if (modelName === 'permission') {
        for (let i = 0; i < arr.length; i++) {
          arr[i].permission = parsingPermission2Obj(arr[i].permission);
        }
      }
      const count = hasLimitPage ? await MongooseCRUD('COUNT', modelName, target) : 0;
      console.log(arr);
      res.status(200).json({
        error_code: 0,
        data: encryptRes(
          hasLimitPage
            ? {
                total: count,
                list: arr,
              }
            : {
                list: arr,
              },
        ),
      });
    }
  });
};

const pAdd = (res, next, modelName, use) => {
  MongooseCRUD('C', modelName, use).then((arr, err) => {
    if (err) next(err);
    else {
      res.status(200).json({
        error_code: 0,
        data: encryptRes({}),
      });
    }
  });
};

const pEdit = async (res, next, modelName, use, _id) => {
  if (modelName === 'permission') use.permission = makePermission(use.permission);
  try {
    let arr = await MongooseCRUD('Uo', modelName, { _id }, use);
    res.status(200).json({
      error_code: !arr['matchedCount'] ? 10007 : 0,
      data: encryptRes({}),
    });
  } catch (error) {
    next(10003);
  }
};

const pAggregate = async (res, modelName, target, hasPage) => {
  MongooseCRUD('A', modelName, target, {}, {}).then(async (arr, err) => {
    console.log(arr);
    if (err) next(err);
    else if (!arr.length) {
      res.status(200).json({
        error_code: 0,
        data: encryptRes({
          total: 0,
          list: [],
        }),
      });
    } else if (hasPage && (!Number.isInteger(hasPage.limit) || !Number.isInteger(hasPage.page))) {
      next(10004);
    } else {
      let lastFilter = target.filter(
        el => Object.keys(el)[0] === '$match' || Object.keys(el)[0] === '$search',
      );
      // Add Count
      lastFilter.push({
        $count: 'count',
      });

      console.log(await MongooseCRUD('A', modelName, lastFilter));
      const total = (await MongooseCRUD('A', modelName, lastFilter))[0].count;
      res.status(200).json({
        error_code: 0,
        data: encryptRes({
          total,
          list: arr,
        }),
      });
    }
  });
};

const canNotBeSameBeforeAdd = async (res, next, modelName, useful, checkKey) => {
  if (!useful[checkKey]) next(10004);
  else {
    let obj = {};
    obj[checkKey] = useful[checkKey];
    const arr = await MongooseCRUD('R', modelName, obj);
    if (arr.length) next(10012);
    else pAdd(res, next, modelName, useful);
  }
};

module.exports = {
  pList,
  pAdd,
  pEdit,
  canNotBeSameBeforeAdd,
  pAggregate,
};
