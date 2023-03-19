const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

// const indexRouter = require("./routes/index");
// const usersRouter = require("./routes/users");
const adminRouter = require("./routes/admin");

const http = require("http");
const { MongooseCRUD } = require("./config/MongoDb/Api");
const { makeToken } = require("./routes/encryptNToken");
const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// app.use("/", indexRouter);
// app.use("/users", usersRouter);
app.use("/admin", adminRouter);

app.get("/", (req, res) => {
  res.render("index.ejs");
});

// catch 404 and forward to error handleryar
app.use(function (req, res, next) {
  res.json({
    error_code: 10001,
    data: {},
  });
});

// error handler
app.use(function (err, req, res, next) {
  console.log(err);
  const error_code = Number.isInteger(err) ? err : 10003;
  res.status(404).json({ error_code, data: { token: "" } });
});

const debug = require("debug")("my-application");
app.set("port", process.env.PORT || 3000);

// 啟動監聽
const server = http.createServer(app);

//DB
//

// MongooseCRUD("C", "battle_paper", {
//   id: 10001,
//   type: 0,
//   title: "[YCSJ] 32強 牌組大揭密",
//   publish_date: "2022/11/15",
//   last_edit_date: "2022/11/15",
//   photo: "",
//   status: 0,
//   content: "這是內容",
//   to_top: false,
//   admin_id: 10001,
//   tag: [],
// }).then((arr, err) => {
//   console.log(arr, err);
// });

// MongooseCRUD(
//   "R",
//   "admin",
//   {},
//   { sort: { id: -1 }, skip: 1, limit: 1 },
//   { id: 1, create_date: 1 }
// ).then((arr, err) => {
//   console.log(arr, err);
// });

server.listen(app.get("port"), function () {
  debug("Express server listening on port " + server.address().port);
});
