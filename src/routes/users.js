var express = require("express");
var router = express.Router();
const UserController = require("../controllers/user");
const { authenticateUser } = require("../middlewares/middleware");
const UserValidator = require("../middlewares/validators/user");

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.get("/profile", [authenticateUser], UserController.getProfile);
router.get("/transactions", [authenticateUser], UserController.getTransactions);
router.post("/create-transaction", [UserValidator.validateCreateTransaction, authenticateUser], UserController.createTransaction);
router.post("/register", UserValidator.validateSignUp, UserController.signUp);
router.post("/login", UserValidator.validateLogin, UserController.signIn);

module.exports = router;
