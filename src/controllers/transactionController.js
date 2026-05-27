const Transaction = require("../models/Transaction");
const Account = require("../models/Account");
const mongoose = require("mongoose");
const Ledger = require("../models/Ledger");
const { sendTransactionEmail, sendTransactionFailureEmail } = require("../services/emailService");


/**
 * @desc    Create a new transaction for the authenticated user
 * @route   POST /api/transactions/
 * @access  Private
 * THE 10-STEP TRANSFER FLOW:
 *    *1. Validate the request body to ensure all required fields are present and correctly formatted.
 *    *2. Validate imdempotency key to prevent duplicate transactions.
 *    *3. Check account status of both sender and receiver to ensure they are ACTIVE.
 *    *4. Verify that the sender has sufficient balance to cover the transaction amount.
 *    *5. Create a new transaction document in the database with status "PENDING".
 *    *6. Create DEBIT ledger entry for the sender's account.
 *   *7. Create CREDIT ledger entry for the receiver's account.
 *   *8. Update the transaction status to "COMPLETED" if all operations succeed, or "FAILED" if any operation fails.
 *    *9. Commit MongoDB transaction to ensure atomicity of all operations.
 *    *10. Send email notification 
 */

const createTransaction = async (req, res) => {
  const {fromAccount, toAccount, amount, idempotencyKey}=req.body; 

  /**
   * *1. Validate the request body to ensure all required fields are present and correctly formatted.
  */
  if(!fromAccount || !toAccount || !amount || !idempotencyKey ){
    return res.status(400).json({
      message: "fromAccount, toAccount, amount, idempotencyKey are required",
    });
  }

  const fromUserAccount = await Account.findOne({
    _id: fromAccount,
  });

  const toUserAccount = await Account.findOne({
    _id: toAccount,
  });

  if(!fromUserAccount || !toUserAccount){
    return res.status(400).json({
      message: "Invalid fromAccount or toAccount",
    });
  }

  /**
   * *2. Validate imdempotency key to prevent duplicate transactions.
  */
  const existingTransaction = await Transaction.findOne({
    idempotencyKey: idempotencyKey
  });

  if(existingTransaction){
    if(existingTransaction.status === "COMPLETED"){
      return res.status(200).json({
        message: "Transaction already processed",
        transaction: existingTransaction,
      });
    }
    else if(existingTransaction.status === "PENDING"){
      return res.status(200).json({
        message: "Transaction is still processing",
      })
    }
    else if(existingTransaction === "FAILED"){
      return res.status(500).json({
        message: "Transaction is failed. Please retry!",
      });
    }
    else if(existingTransaction === "REVERSED"){
      return res.status(500).json({
        message: "Transaction was reversed. Please retry!",
      });
    }
  }

  /**
   *3. Check account status of both sender and receiver to ensure they are ACTIVE. 
  */
 console.log(fromUserAccount.status, toUserAccount.status);
 
  if(fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE"){
    return res.status(400).json({
      message:"Both fromAccount and toAccount must be ACTIVE to process the transaction"
    });
  }

  /**
   *4. Verify that the sender has sufficient balance to cover the transaction amount. 
  */
  const balance = await fromUserAccount.getBalance();

  if(balance < amount){
    return res.status(400).json({
      message : `Insufficient balance. Current balance is ${balance} and requested amount is ${amount}`
    });
  }
  let newTransaction;
  try{
    /**
     *5. Create a new transaction document in the database with status "PENDING". 
    */

    const session = await mongoose.startSession();
    session.startTransaction();

    newTranscation = (await Transaction.create([{
    fromAccount,
    toAccount,
    amount,
    idempotencyKey,
    status: "PENDING",
    }],{session}))[0];


    /**
     *6. Create DEBIT ledger entry for the sender's account. 
    */
    const debitLedgerEntry = await Ledger.create([{
    account: fromAccount,
    amount,
    transaction: newTranscation._id,
    type: "DEBIT"
    }],{session});

    await (() => {
      return new Promise(resolve => setTimeout(resolve, 15*1000));
    })()

    /**
     *7. Create CREDIT ledger entry for the receiver's account. 
    */

    const creditLedgerEntry = await Ledger.create([{
    account: toAccount,
    amount,
    transaction: newTranscation._id,
    type: "CREDIT"
    }],{session});

    /**
     * 8. Update the transaction status to "COMPLETED" if all operations succeed, or "FAILED" if any operation fails 
    */

    await Transaction.findOneAndUpdate(
      {_id: newTranscation._id},
      {status: "COMPLETED"},
      {session}
    );

    /**
     *9. Commit MongoDB transaction to ensure atomicity of all operations. 
    */

    await session.commitTransaction();
    session.endSession();
  }catch(error){
    return res.status(400).json({
      message: "Transaction is pending due to some issue, please try again after some time",
      error: error.message
    })
  }

  /**
   * 10. Send Mail notification 
  */
 await sendTransactionEmail(req.user.email, req.user.name, amount, toAccount);

 res.status(201).json({
  message: "Transaction completed successfully",
  transaction: newTranscation,
 });

}

const createInitialFundsTransaction = async (req,res) => {
  const {toAccount, amount, idempotencyKey} = req.body;

  if(!toAccount || !amount || !idempotencyKey){
    return res.status(400).json({
      message: "toAccount, amount and idempotency is required"
    });
  }

  const userAccount = await Account.findOne({
    _id: toAccount
  });

  if(!userAccount){
    return res.status(400).json({
      message: "Invalid Account",
    });
  }

  const fromUserAccount = await Account.findOne({
    user: req.user._id,
  });

  if(!fromUserAccount){
    return res.status(400).json({
      message: "System user account is not found"
    });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  const newTranscation = new Transaction({
  fromAccount: fromUserAccount._id,
  toAccount,
  amount,
  idempotencyKey,
  status: "PENDING",
  });

  const debitLedgerEntry = await Ledger.create([{
  account: fromUserAccount,
  amount: amount,
  transaction: newTranscation._id,
  type: "DEBIT"
  }],{session});

  const creditLedgerEntry = await Ledger.create([{
  account: toAccount,
  amount: amount,
  transaction: newTranscation._id,
  type: "CREDIT"
  }],{session})

  newTranscation.status = "COMPLETED";
  await newTranscation.save({session});

  await session.commitTransaction();
  session.endSession();

  return res.status(201).json({
    message: "Initial funds transaction completed successfully",
    transaction: newTranscation,
  });
}

module.exports = {
  createTransaction,
  createInitialFundsTransaction,
}