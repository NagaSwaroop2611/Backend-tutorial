const express = require('express');

/**
 * @desc    Router for handling authentication requests
  * @route   /api/auth
 */
const userRouter = require('./routes/authRoutes');

/**
 * @desc    Router for handling account related requests
 * @route   /api/accounts
 */
const accountRouter = require("./routes/accountRoutes")
const cookieParser = require('cookie-parser');
const transactionRouter = require('./routes/transactionRoutes');

const app = express();

app.use(express.json());
app.use(cookieParser());

/**
 * - Use Routes 
*/

// Health check
app.get("/", (req,res) => {
  res.send("Ledger service is up and running");
})
app.use('/api/auth', userRouter);
app.use('/api/accounts', accountRouter);
app.use('/api/transactions',transactionRouter);


module.exports = app;