const mongoose = require("mongoose");

const ledgerSchema = new mongoose.Schema({
  account:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"Account",
    required: [true, "Ledger entry must be associated with an account"],
    index: true,
    immutable: true, // Account reference should not change once set
  },
  amount:{
    type: Number,
    required: [true, "Ledger entry must have an amount"],
    immutable: true, // Amount should not change once set
  },
  transaction:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"Transaction",
    required: [true, "Ledger entry must be associated with a transaction"],
    index: true,
    immutable: true, // Transaction reference should not change once set
  },
  type:{
    type: String,
    enum: {
      values:["DEBIT", "CREDIT"],
      message: "type can be either DEBIT or CREDIT",
    },
    required: [true, "Ledger entry must have a transaction type"],
    immutable: true, // Transaction type should not change once set
  },
});

function preventLedgerModification() {
  throw new Error("Ledger entries cannot be modified once created");
}

ledgerSchema.pre("findOneAndUpdate", preventLedgerModification);
ledgerSchema.pre("updateOne", preventLedgerModification);
ledgerSchema.pre("updateMany", preventLedgerModification);
ledgerSchema.pre("findOneAndDelete", preventLedgerModification);
ledgerSchema.pre("deleteOne", preventLedgerModification);
ledgerSchema.pre("deleteMany", preventLedgerModification);
ledgerSchema.pre("findOneAndRemove", preventLedgerModification);
ledgerSchema.pre("remove", preventLedgerModification);
ledgerSchema.pre("findOneAndReplace", preventLedgerModification);
ledgerSchema.pre("replaceOne", preventLedgerModification);

const Ledger = mongoose.model("Ledger", ledgerSchema);

module.exports = Ledger;