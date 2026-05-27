const mongoose = require("mongoose");

const tokenBlackListSchema = new mongoose.Schema({
  token:{
    type: String,
    required: [true, "Token is required to blacklist"],
    unique: [true, "Token is already blacklisted"]
  },
}, {timestamps: true});

tokenBlackListSchema.index({createdAt: 1},
  {
    expireAfterSeconds: 60*60*24*3 // 3days 
  }
);

const Blacklist = mongoose.model("Blacklist", tokenBlackListSchema);

module.exports = Blacklist;