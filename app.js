const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
import line, { middleware } from '@line/bot-sdk';
import dotenv from 'dotenv';
dotenv.config();

// const indexRouter = require("./routes/index");
// const usersRouter = require("./routes/users");
const {
  adminRouter,
  serialIntroductionRouter,
  seriesStoryRouter,
  usefulCardIntroductionRouter,
  metaDeckRouter,
  productInformationRouter,
  productionInformationTypeRouter,
  cardsRouter,
  battlePaperRouter,
  rulesRouter,
  calendarRouter,
  tagRouter,
  bannerRouter,
  packTypeRouter,
  permissionRouter,
  cardsImageRouter,
  deckRouter,
  memberRouter,
  searchRouter,
} = require('./routes/index');

const http = require('http');
const { encryptRes } = require('./config/tools/encryptNToken');
const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
// app.set("view engine", "html");

app.use(logger('dev'));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Back End
app.use('/api/admin', adminRouter);
app.use('/api/serialIntroduction', serialIntroductionRouter);
app.use('/api/usefulCardIntroduction', usefulCardIntroductionRouter);
app.use('/api/metaDeck', metaDeckRouter);
app.use('/api/productInformation', productInformationRouter);
app.use('/api/rules', rulesRouter);
app.use('/api/seriesStory', seriesStoryRouter);
app.use('/api/battlePaper', battlePaperRouter);
app.use('/api/cards', cardsRouter);
app.use('/api/productionInformationType', productionInformationTypeRouter);
app.use('/api/calendar', calendarRouter);
app.use('/api/tag', tagRouter);
app.use('/api/banner', bannerRouter);
app.use('/api/packType', packTypeRouter);
app.use('/api/permission', permissionRouter);
app.use('/api/cardsImage', cardsImageRouter);
app.use('/api/deck', deckRouter);
app.use('/api/member', memberRouter);
app.use('/api/search', searchRouter);

app.post('/webhook', middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then(result => res.json(result))
    .catch(err => {
      console.error(err);
      res.status(500).end();
    });
});

// 處理接收到的訊息
function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    // 非文字訊息時忽略
    return Promise.resolve(null);
  }

  let responseMessage = '';
  const text = event.message.text.trim().toLowerCase();

  // 根據訊息內容回應
  if (text.startsWith('/s ')) {
    responseMessage = '酷酷的';
  } else if (text.startsWith('/p ')) {
    responseMessage = '價格';
  }

  if (responseMessage) {
    return line.Client.replyMessage(event.replyToken, {
      type: 'text',
      text: responseMessage,
    });
  }

  return Promise.resolve(null);
}

app.get('/api/', (req, res) => {
  res.sendfile('./views/index.html');
});
app.get('/api/s', (req, res) => {
  res.sendfile('./views/sss.html');
});

app.use('/api/card-image', express.static(path.join(__dirname, '/public/image')));

app.use(
  cors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  }),
);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  res.status(404).json(
    encryptRes({
      error_code: 10001,
      data: {},
    }),
  );
});

// error handler
app.use(function (err, req, res, next) {
  console.log('Error Code :', err);
  const error_code = Number.isInteger(err) ? err : 10003;
  res.status(200).json({ error_code, data: {} });
});

const debug = require('debug')('my-application');
app.set('port', process.env.PORT || 3300);

// 啟動監聽
const server = http.createServer(app);

server.listen(app.get('port'), function () {
  debug('Express server listening on port ' + server.address().port);
});
