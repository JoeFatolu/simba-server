const { successResponse, errorResponse, errorResponseLog } = require("../helpers/response");
const mongoose = require("mongoose");
const UserProvider = require("../providers/user");
const CurrencyProvider = require("../providers/currency");
const TransactionProvider = require("../providers/transaction");
const Transaction = require("mongoose").model("Transaction");

exports.signUp = async (req, res) => {
  try {
    const { body } = req;

    const existingEmailAddress = await UserProvider.findOne({
      email: body.email.toLowerCase(),
    });

    if (existingEmailAddress) {
      return errorResponse(res, {}, "This email address is already registered.");
    }

    const passwordInfo = UserProvider.setPassword(body.password);
    const currencies = await CurrencyProvider.find({});

    const accounts = currencies.map((data) => {
      if (data.code === "USD") {
        return {
          balance: 1000,
          currency: data._id,
        };
      }
      return {
        currency: data._id,
      };
    });

    const userInfo = await UserProvider.create({
      ...body,
      email: body.email.toLowerCase(),
      salt: passwordInfo.salt,
      hash: passwordInfo.hash,
      accounts: accounts,
    });

    await userInfo.populate({ path: "accounts.currency" });

    const token = UserProvider.generateJWT(userInfo);

    return successResponse(res, { user: { ...userInfo.toJSON(), token } }, "User registered successfully.");
  } catch (err) {
    console.log(err);
    return errorResponseLog(res, {}, "Something went wrong, please try again later", err);
  }
};

exports.signIn = async (req, res) => {
  try {
    const { body } = req;
    const user = await UserProvider.findOneAndPopulate(
      {
        email: body.email.toLowerCase(),
      },
      "accounts.currency"
    );

    if (
      !user ||
      !UserProvider.validPassword({
        salt: user.salt,
        hash: user.hash,
        password: body.password,
      })
    ) {
      return errorResponse(res, {}, "The email address or password is incorrect.");
    }

    const token = UserProvider.generateJWT(user);

    return successResponse(res, { user: { ...user.toJSON(), token } }, "User authenticated successfully.");
  } catch (e) {
    return errorResponseLog(res, {}, "Could not authenticate user.", e);
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await UserProvider.findOneAndPopulate({ _id: req.payload.id }, "accounts.currency");
    if (!user) {
      return errorResponse(res, {}, "User not authenticated", 401);
    }
    return successResponse(res, { user }, "Profile fetched successfully");
  } catch (err) {
    return errorResponseLog(res, {}, "Could not fetch profile.", err);
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const options = {
      page: req.query.page || 1,
      limit: req.query.limit || 10,
    };

    const query = [
      {
        $match: {
          $or: [
            {
              from: mongoose.Types.ObjectId(req.payload.id),
            },
            {
              to: mongoose.Types.ObjectId(req.payload.id),
            },
          ],
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "from",
          foreignField: "_id",
          as: "from",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "to",
          foreignField: "_id",
          as: "to",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "by",
          foreignField: "_id",
          as: "by",
        },
      },
      {
        $lookup: {
          from: "currencies",
          localField: "fromCurrency",
          foreignField: "_id",
          as: "fromCurrency",
        },
      },
      {
        $lookup: {
          from: "currencies",
          localField: "toCurrency",
          foreignField: "_id",
          as: "toCurrency",
        },
      },
      {
        $unwind: {
          path: "$from",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$to",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$by",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$fromCurrency",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$toCurrency",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          "from.firstName": 1,
          "from.lastName": 1,
          "from._id": 1,
          "to.firstName": 1,
          "to.lastName": 1,
          "to._id": 1,
          "by._id": 1,
          amountSent: 1,
          amountReceived: 1,
          createdAt: 1,
          updatedAt: 1,
          "fromCurrency.code": 1,
          "fromCurrency.symbol": 1,
          "toCurrency.code": 1,
          "toCurrency.symbol": 1,
        },
      },
    ];

    const aggregate = await Transaction.aggregate(query);
    aggregate._pipeline = query;
    const transactions = await Transaction.aggregatePaginate(aggregate, options);

    return successResponse(res, { transactions }, "Tranasctions fetched succefully");
  } catch (e) {
    console.log(e);
    return errorResponseLog(res, {}, "Something went wrong while fetching transactions", e);
  }
};
exports.createTransaction = async (req, res) => {
  try {
    const body = req.body;
    const user = await UserProvider.findOneAndPopulate({ _id: req.payload.id }, "accounts.currency");
    const reciever = await UserProvider.findOneAndPopulate({ _id: req.body.to }, "accounts.currency");
    if (!reciever) {
      return errorResponse(res, {}, "Invalid Receiver", 401);
    }
    const recieverAccountIndex = reciever.accounts.findIndex((el) => String(el.currency._id) === req.body.targetCurrency);
    const userAccountIndex = user.accounts.findIndex((el) => String(el.currency._id) === req.body.sourceCurrency);

    if (recieverAccountIndex === -1 || userAccountIndex === -1) {
      return errorResponse(res, {}, "Currency not avalaible");
    }

    reciever.accounts[recieverAccountIndex].balance += parseInt(body.amount);
    user.accounts[userAccountIndex].balance -= (parseInt(body.amount) / user.accounts[userAccountIndex].currency.usdRate) * reciever.accounts[recieverAccountIndex].currency.usdRate;

    if (user.accounts[userAccountIndex].balance < 0) {
      return errorResponse(res, {}, "Insufficeint Funds");
    }
    const transaction = await TransactionProvider.create({
      from: user._id,
      to: reciever._id,
      amountReceived: body.amount,
      amountSent: (parseInt(body.amount) / user.accounts[userAccountIndex].currency.usdRate) * reciever.accounts[recieverAccountIndex].currency.usdRate,
      fromCurrency: user.accounts[userAccountIndex].currency._id,
      by: user._id,
      toCurrency: reciever.accounts[recieverAccountIndex].currency._id,
    });

    await user.save();
    await reciever.save();

    return successResponse(res, { transaction }, "Transaction created successfully");
  } catch (err) {
    console.log(err);
    return errorResponseLog(res, {}, "Could not create transaction.", err);
  }
};
exports.users = async (req, res) => {
  try {
    const users = await UserProvider.find({ _id: { $nin: [mongoose.Types.ObjectId(req.payload.id)] } });
    if (!users) {
      return errorResponse(res, {}, "User not authenticated", 401);
    }
    const usersNameAndEmail = users.map(({ firstName, lastName, email, _id }) => ({
      value: _id,
      label: `${firstName} ${lastName}- ${email}`,
    }));
    return successResponse(res, { users: usersNameAndEmail }, "Profile fetched successfully");
  } catch (err) {
    console.log(err);
    return errorResponseLog(res, {}, "Could not fetch users.", err);
  }
};

// exports.add = async (req, res) => {
//   try {
//     await Currency.create(req.body);
//     res.send("Succes").status(200);
//   } catch (error) {
//     console.log(err);
//     return errorResponseLog(res, {}, "Could not fetch users.", err);
//   }
// };
