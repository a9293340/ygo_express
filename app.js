const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

// const indexRouter = require("./routes/index");
// const usersRouter = require("./routes/users");
const adminRouter = require("./routes/backend/admin");

const http = require("http");
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
app.use("/api/admin", adminRouter);

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
  console.log("Error Code :", err);
  const error_code = Number.isInteger(err) ? err : 10003;
  res.status(404).json({ error_code, data: {} });
});

const debug = require("debug")("my-application");
app.set("port", process.env.PORT || 3000);

// 啟動監聽
const server = http.createServer(app);

server.listen(app.get("port"), function () {
  debug("Express server listening on port " + server.address().port);
});
