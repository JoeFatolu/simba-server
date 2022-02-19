const corsMiddleware = (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "PUT,GET,DELETE,POST,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With,Content-Type, Accept, Authorization, Apptoken" +
      " Access-Control-Allow-Credential"
  );
  res.header("Access-Control-Allow-Credentials", "true");
  next();
};

module.exports = corsMiddleware;
