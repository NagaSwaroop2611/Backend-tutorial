const Blacklist = require("../models/Blacklist");
const User = require("../models/User");
const jwt = require("jsonwebtoken");


async function authMiddleware(req, res, next) {
  const token = req.cookies.token || req.header("Authorization")?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ status: "failed", message: "Unauthorized: No token provided" });
  }

  const isBlacklisted = await Blacklist.findOne({ token });

  if(isBlacklisted){
    return res.status(401).json({
      message: "Unauthorized accessed, token is blacklisted"
    })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ status: "failed", message: "Unauthorized: User not found" });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ status: "failed", message: "Unauthorized: Invalid token" });
  }
};

const authSystemUserMiddleware = async (req,res,next) => {
  const token = req.cookies.token || req.header("Authorization")?.split(" ")[1];
  console.log("Token from cookie:", req.cookies.token);
  console.log("Token from header:", req.header("Authorization"));
  if (!token) {
    return res.status(401).json({ status: "failed", message: "Unauthorized: No token provided" });
  }

  const isBlacklisted = await Blacklist.findOne({ token });

  if(isBlacklisted){
    return res.status(401).json({
      message: "Unauthorized accessed, token is blacklisted"
    })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("+systemUser");

    if(!user.systemUser){
      return res.status(403).json({
        message: "Forbidden access, not a system user"
      });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ status: "failed", message: "Unauthorized: Invalid token" });
  }
}

module.exports = {authMiddleware, authSystemUserMiddleware};