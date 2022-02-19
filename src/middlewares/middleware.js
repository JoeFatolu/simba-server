const jwt = require("jsonwebtoken");
const { errorResponse, errorResponseLog } = require("../helpers/response");
const BaseAppError = require("../errors/base");
const { secret } = require("../config");
const USerProvider = require("../providers/user");

exports.authenticateUser = async (req, res, next) => {
  if (!req.header("Authorization")) {
    return errorResponse(res, {}, "Not authenticated", 401);
  }
  const token = req.header("Authorization").split(" ")[1];
  try {
    const payload = await jwt.verify(token, secret);
    if (!payload) {
      return errorResponse(res, {}, "Authentication error", 401);
    }
    const { id } = payload;
    const customer = await USerProvider.findOne({ _id: id });
    if (!customer) {
      return errorResponse(
        res,
        {},
        "Authentication error. User not found",
        401
      );
    }
    req.payload = payload;
    return next();
  } catch (e) {
    return errorResponseLog(res, {}, "Not authenticated.", e, 401);
  }
};

exports.appErrorHandler = async (err, req, res, next) => {
  console.log(err);
  if (err.status && err.status === 404) {
    return errorResponseLog(res, {}, "Route not found", err, 404);
  }
  if (err instanceof BaseAppError || err.appError) {
    return errorResponseLog(res, {}, err.message, err, 400);
  }
  return errorResponseLog(res, {}, "Something went wrong with our system", err);
};
