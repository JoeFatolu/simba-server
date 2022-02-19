module.exports = {
  secret: process.env.NODE_ENV === "production" ? process.env.SECRET : "secret",
  dbString: `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/${process.env.DB_NAME}?retryWrites=true&w=majority`,
};
