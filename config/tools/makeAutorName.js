const { MongooseCRUD } = require('../MongoDb/Api');

const makeAuthorName = async arr => {
  if (Array.isArray(arr)) {
    const admin_ids = arr.map(x => x.admin_id);
    const authors = await MongooseCRUD(
      'R',
      'admin',
      { _id: admin_ids },
      {},
      {
        _id: 1,
        name: 1,
      },
    );

    let res = JSON.parse(JSON.stringify(arr));
    for (let i = 0; i < res.length; i++) {
      const tar = res[i].admin_id;
      const name = authors.find(x => x._id.toString() === tar).name;
      res[i].author_name = name;
    }
    return res;
  } else return arr;
};

module.exports = {
  makeAuthorName,
};
