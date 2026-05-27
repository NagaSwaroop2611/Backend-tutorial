const User = require("../models/User");
const jwt = require("jsonwebtoken");
const {sendRegestrationEmail} = require("../services/emailService");
const Blacklist = require("../models/Blacklist");

/** 
* @desc    Register a new user
* @route   POST /api/auth/register
* @access  Public
*/
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(422).json({
      status: "failed", 
      message: "Email already exists. Please use a different email." 
    });
  }

  const newUser = await User.create({ name, email, password });
  const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  // res.cookie("token", token, {
  //   httpOnly: true,
  //   secure: process.env.NODE_ENV === "production",
  //   sameSite: "strict",
  //   maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  // });

  res.cookie("token", token);

  res.status(201).json({
    status: "success",
    user: {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
    },
    token,
  });
  console.log("first");
  

  await sendRegestrationEmail(newUser.email,newUser.name);
};

/** 
* @desc    Login a user
* @route   POST /api/auth/login
* @access  Public
*/
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return res.status(401).json({ 
      status: "failed", 
      message: "Invalid email or password." 
    });
  }

  const isValidPassword = await user.comparePassword(password);
  if (!isValidPassword) {
    return res.status(401).json({ 
      status: "failed", 
      message: "Invalid email or password." 
    });
  }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  // res.cookie("token", token, {
  //   httpOnly: true,
  //   secure: process.env.NODE_ENV === "production",
  //   sameSite: "strict",
  //   maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  // });

  res.cookie("token", token);

  res.status(200).json({
    status: "success",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
    token,
  });
};

/**
 * @desc Logout user controller
 * @route /api/auth/logout
 * @access private 
*/

const logoutUser = async (req,res) => {
  const token = req.cookies.token || req.header("Authorization")?.split(" ")[1];

  if(!token){
    return res.status(200).json({
      message: "User logged out successfully"
    });
  }

  res.clearCookie("token");

  await Blacklist.create({
    token: token
  });

  res.status(200).json({
    message: "User logged out succesfully",
  })
}

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
};