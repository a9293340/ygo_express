const adminRouter = require('./backend/admin');
const serialIntroductionRouter = require('./backend/serialIntroduction');
const usefulCardIntroductionRouter = require('./backend/usefulCardIntroduction');
const metaDeckRouter = require('./backend/metaDeck');
const productInformationRouter = require('./backend/productInformation');
const rulesRouter = require('./backend/rules');
const seriesStoryRouter = require('./backend/seriesStory');
const battlePaperRouter = require('./backend/battlePaper');
const cardsRouter = require('./backend/cards');
const productionInformationTypeRouter = require('./backend/productionInformationType');
const calendarRouter = require('./backend/calendar');
const tagRouter = require('./backend/tag');
const bannerRouter = require('./backend/banner');
const packTypeRouter = require('./backend/packType');
const permissionRouter = require('./backend/permission');
const cardsImageRouter = require('./backend/cardsImage');

const deckRouter = require('./frontend/deck');
const memberRouter = require('./frontend/member');
const searchRouter = require('./frontend/search');
const jurisprudenceRouter = require('./frontend/jurisprudence');
const forbiddenCardListRouter = require('./frontend/forbiddenCardList');

const lineBotRouter = require('./linebot/webhook');

module.exports = {
  adminRouter,
  serialIntroductionRouter,
  usefulCardIntroductionRouter,
  metaDeckRouter,
  productInformationRouter,
  rulesRouter,
  seriesStoryRouter,
  battlePaperRouter,
  cardsRouter,
  productionInformationTypeRouter,
  calendarRouter,
  tagRouter,
  bannerRouter,
  packTypeRouter,
  permissionRouter,
  cardsImageRouter,
  deckRouter,
  memberRouter,
  searchRouter,
  lineBotRouter,
  jurisprudenceRouter,
  forbiddenCardListRouter,
};
