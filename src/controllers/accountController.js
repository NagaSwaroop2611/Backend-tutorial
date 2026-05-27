const Account = require('../models/Account');


/**
 * @desc    Create a new account for the authenticated user
 * @route   POST /api/accounts/
 * @access  Private
 */

const createAccount = async (req, res) => {
  const user = req.user; // Get the authenticated user from the request

  const account = await Account.create({
    user: user._id, 
  });

  res.status(201).json({
    status: "success",
    account,
  });
}

const getUserAccounts = async (req,res) => {
  const accounts = await Account.find({user: req.user._id});

  res.status(200).json({
    message: `Fetched all counts of ${req.user.name} successfully`,
    accounts,
  })
}

const getAccountBalance = async (req, res) => {
  const {accountId} = req.params;

  const account = await Account.findOne({
    _id: accountId,
    user: req.user._id,
  });

  if(!account){
    return res.status(404).json({
      message: "Account not found",
    });
  }

  const balance = await account.getBalance();

  res.status(200).json({
    accountId: account._id,
    balance,
  })
}

module.exports ={ createAccount, getUserAccounts, getAccountBalance}