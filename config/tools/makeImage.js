const { v4 } = require('uuid');
const fs = require('fs');

const makeImage = (photo, path, needToken = 'make') => {
  const token = needToken === 'make' ? v4() : needToken;
  const idx = photo.indexOf(';base64,') + 8;
  const type = photo.substring(photo.indexOf('/') + 1, photo.indexOf(';'));
  if (!fs.readdirSync(`./public/image/${path}`)) fs.mkdirSync(`./public/image/${path}`);
  fs.writeFileSync(`./public/image/${path}/${token}.${type}`, photo.substring(idx), 'base64');

  return `${token}.${type}`;
};

module.exports = {
  makeImage,
};
