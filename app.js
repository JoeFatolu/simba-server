require("dotenv").config();

var createError = require("http-errors");
var express = require("express");
var cors = require("cors");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
require("./src/models/db")();

var indexRouter = require("./src/routes/index");
var usersRouter = require("./src/routes/users");
const { appErrorHandler } = require("./src/middlewares/middleware");
const corsMiddleware = require("./src/middlewares/cors");

var app = express();

// view engine setup

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());
app.options("*", cors());
app.use(corsMiddleware);
app.use("/", indexRouter);
app.use("/user", usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});
app.use(appErrorHandler);
module.exports = app;
