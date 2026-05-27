const express = require('express');
const { registerUser, loginUser, logoutUser } = require('../controllers/authController');

const userRouter = express.Router();

/**
* @route POST /api/auth/register
*/
userRouter.post('/register', registerUser);

/**
* @route POST /api/auth/login
*/
userRouter.post('/login', loginUser);

/**
 * @desc logout user
 * @route POST /api/auth/logout
*/
userRouter.post('/logout', logoutUser);

module.exports = userRouter;