const mongoose = require("mongoose");
const { dbString } = require("../config");

const connectDB = () => {
  mongoose
    .connect(dbString)
    .then((conn) => {
      console.log("DB Connected");
    })
    .catch((error) => {
      console.log("DB Error", error);
    });

  mongoose.connection.on("connected", () => {
    console.log("Mongoose connected");
  });
  mongoose.connection.on("error", (err) => {
    console.log(`Mongoose connection error: ${err}`);
  });
  mongoose.connection.on("disconnected", () => {
    console.log("Mongoose disconnected");
  });
};

require("./user");
require("./transaction");
require("./currency");

module.exports = connectDB;
