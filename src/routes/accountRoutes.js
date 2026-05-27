const express = require("express");
const {authMiddleware} = require("../middleware/authMiddleware");
const { createAccount, getUserAccounts, getAccountBalance } = require("../controllers/accountController");

const accountRouter = express.Router();

/**
 * @desc    Create a new account for the authenticated user
 * @route   POST /api/accounts/
 * @access  Private
*/
accountRouter.post ("/", authMiddleware, createAccount);

/**
 * @desc get all accounts of the logged-in user
 * @route GET /api/accounts/
 * @access Private
*/
accountRouter.get("/", authMiddleware, getUserAccounts);

/**
 * @desc get balance of an account using its id
 * @route GET /api/accounts/balance/:accountId
 * @access Private
*/
accountRouter.get("/balance/:accountId", authMiddleware,getAccountBalance);


module.exports = accountRouter;