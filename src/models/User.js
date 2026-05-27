const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required for creating a user."],
  },
  email: {
    type: String,
    required: [true, "Email is required for creating a user."],
    unique: [ true, "Email already exists. Please use a different email."],
    trim: true,
    lowercase: true,
    match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,"Please provide a valid email address."],
  },
  password: {
    type: String,
    required: [true, "Password is required for creating a user."],
    minlength: [6, "Password must be at least 6 characters long."],
    select: false, // Exclude password from query results by default
  },
  systemUser: {
    type: Boolean,
    default: false,
    immutable: true,
    select: false,
  }
},
{ timestamps: true },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);
module.exports = User;