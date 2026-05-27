const express = require("express");
const {authMiddleware, authSystemUserMiddleware} = require("../middleware/authMiddleware");
const { createTransaction, createInitialFundsTransaction } = require("../controllers/transactionController");

const transactionRouter = express.Router();

/**
 * @desc    Create a new transaction for the authenticated user
 * @route   POST /api/transactions/
 * @access  Private
*/
transactionRouter.post("/", authMiddleware,createTransaction);

/**
 * @desc Additional treansaction routes can be added here or create initial funds transaction from system account
 * @route POST /api/transactions/system/initial-funds
*/
transactionRouter.post("/system/inital-funds", authSystemUserMiddleware,createInitialFundsTransaction);

module.exports = transactionRouter;