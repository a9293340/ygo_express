const { v4 } = require('uuid');
const { makeImage } = require('./makeImage.js');
const fs = require('fs');

const removeNotHaveImage = (content, id) => {
  const imageFile = fs.readdirSync('./public/image/article/').filter(x => x.indexOf(id) !== -1);
  for (let i = 0; i < imageFile.length; i++) {
    const img = imageFile[i];
    content.indexOf(img) === -1 && fs.unlinkSync(`./public/image/article/${img}`);
  }
};

const useCutBase64FromContent = (content, id) => {
  removeNotHaveImage(content, id);
  let contents = [];
  const checkImageTag = '<img class="wscnph" src="';
  const lastImageTag = '/>';
  let str = content;

  while (str.indexOf(checkImageTag) !== -1) {
    // 片段儲存
    contents.push(str.substring(0, str.indexOf(checkImageTag) + checkImageTag.length));

    // 剩下
    str = str.substring(str.indexOf(checkImageTag) + checkImageTag.length);

    // 取圖
    let img = str.substring(0, str.indexOf(lastImageTag) - 2);
    if (img.indexOf('base64') !== -1) {
      let type = img.substring(img.indexOf('/') + 1, img.indexOf(';'));
      let name = `${id}-${v4()}`;
      makeImage(img, 'article', name);
      // 刪除圖片base64
      str = str.substring(str.indexOf(lastImageTag) - 2);
      // 替代圖片文字
      str = `${process.env.DOMAIN}/api/card-image/article/${name}.${type}` + str;
    } else if (img.indexOf('/api/card-image') !== -1) {
      contents.push(img);
      // 刪除圖片base64
      str = str.substring(str.indexOf(lastImageTag) - 2);
    } else {
      console.log('same', img);
    }
  }

  return contents.join('') + str;
};

module.exports = {
  useCutBase64FromContent,
};
