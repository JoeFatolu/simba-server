var express = require("express");
var router = express.Router();
const { authenticateUser } = require("../middlewares/middleware");
const UserController = require("../controllers/user");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.send({ status: "success", message: "Up and running" });
});

/* GET users */
router.get("/users", authenticateUser, UserController.users);
// router.post("/addCurrency", UserController.add);

module.exports = router;
