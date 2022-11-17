const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");

const http = require("http");
const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

const debug = require("debug")("my-application");
app.set("port", process.env.PORT || 3000);

// 啟動監聽
const server = http.createServer(app);

//DB

// MongooseCRUD('C','admin',{
//   "id": 4432,
//   "type": 0,
//   "name": 'Alex',
//   "create_date": '2022/11/15',
//   "photo": '',
//   "status": 0,
//   "account": 'eric9527',
//   "password": 'eric9527',
//   "frontend_token": '',
//   "backend_token": '',
//   "deck_id": [],
//   "series_introduction_id": [],
//   "useful_card_introduction_id": [],
//   "meta_deck_id": [],
//   "product_information_id": [],
//   "rules_id": [],
//   "series_story_id": [],
//   "battle_paper_id": [],
// }).then((arr,err)=>{
//   console.log(arr,err)
// })

server.listen(app.get("port"), function () {
  debug("Express server listening on port " + server.address().port);
});
