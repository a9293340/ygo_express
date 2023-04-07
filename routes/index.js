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
};
