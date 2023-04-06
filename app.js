const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

// const indexRouter = require("./routes/index");
// const usersRouter = require("./routes/users");
const adminRouter = require("./routes/backend/admin");
const serialIntroductionRouter = require("./routes/backend/serialIntroduction");
const usefulCardIntroductionRouter = require("./routes/backend/usefulCardIntroduction");
const metaDeckRouter = require("./routes/backend/metaDeck");
const productInformationRouter = require("./routes/backend/productInformation");
const rulesRouter = require("./routes/backend/rules");
const seriesStoryRouter = require("./routes/backend/seriesStory");
const battlePaperRouter = require("./routes/backend/battlePaper");
const cardsRouter = require("./routes/backend/cards");
const productionInformationTypeRouter = require("./routes/backend/productionInformationType");

const http = require("http");
const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
// app.set("view engine", "html");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Back End
app.use("/api/admin", adminRouter);
app.use("/api/serialIntroduction", serialIntroductionRouter);
app.use("/api/usefulCardIntroduction", usefulCardIntroductionRouter);
app.use("/api/metaDeck", metaDeckRouter);
app.use("/api/productInformation", productInformationRouter);
app.use("/api/rules", rulesRouter);
app.use("/api/seriesStory", seriesStoryRouter);
app.use("/api/battlePaper", battlePaperRouter);
app.use("/api/cards", cardsRouter);
app.use("/api/productionInformationType", productionInformationTypeRouter);

app.get("/", (req, res) => {
  res.sendfile("./views/index.html");
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
