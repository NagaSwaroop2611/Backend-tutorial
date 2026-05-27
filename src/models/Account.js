const mongoose = require("mongoose");
const Ledger = require("./Ledger")

const accountSchema = new mongoose.Schema({
  user:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"User",
    required: [true, "Account must be associated with a user"],
    index: true
  },
  status:{
    type: String,
    enum: {
      values:["ACTIVE", "FROZEN", "CLOSED"],
      message: "status can be either ACTIVE, FROZEN or CLOSED",
    },
    default: "ACTIVE",
  },
  currency:{
    type: String,
    required: [true, "Currency is required for creating an account"],
    default: "INR"
  },
},{timestamps: true});

accountSchema.index({user: 1,status:1}); //Compound index

accountSchema.methods.getBalance = async function(){
  const balanceData = await Ledger.aggregate([
    {$match: {account: this._id}},
    {
      $group: {
        _id:null,
        totalDebit:{
          $sum:{
            $cond:[
              {$eq: ["$type", "DEBIT"]},
              "$amount",0
            ]
          }
        },
        totalCredit:{
          $sum:{
            $cond:[
              {$eq: ["$type", "CREDIT"]},
              "$amount",0
            ]
          }
        },
      }
    },
    {
      $project: {
        _id:0,
        balance: {$subtract: ["$totalCredit","$totalDebit"]}
      }
    }
  ])
  return balanceData.length === 0 ? 0 : balanceData[0].balance
}

const Account = mongoose.model("account", accountSchema);

module.exports = Account;