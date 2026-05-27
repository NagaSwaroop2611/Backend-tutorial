require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Backend-ledger" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    // console.log(info);
    console.log(nodemailer);
    
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    console.log(info.response);
    
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

const sendRegestrationEmail = async (mail, name) => {
  const subject = 'Welcome to Backend-ledger!';
  const text = `Hello ${name},\n\nThank you for registering with Backend-ledger! We're excited to have you on board.\n\nBest regards,\nThe Backend-ledger Team`;
  const html = `<p>Hello ${name},</p><p>Thank you for registering with <strong>Backend-ledger</strong>! We're excited to have you on board.</p><p>Best regards,<br>The Backend-ledger Team</p>`;

  await sendEmail(mail, subject, text,html)
}

const sendTransactionEmail = async(userEmail, name, amount, toAccount) => {
  const subject = "Transaction Successful";
  const text = `Hello ${name},\n\n Your transaction of $${amount} to account ${toAccount} was successful.\n\nBest regards,\n The Backend Ledger Team`;
  const html = `<p>Hello ${name},</p>
                <p>Your transaction of $${amount} to account ${toAccount} was successful. </p>              
                <p>Best regards,</br> The Backend Ledger Team</p>`;
  
  await sendEmail(userEmail,subject,text,html)
}

const sendTransactionFailureEmail = async(userEmail, name, amount, toAccount) => {
  const subject = "Transaction Failed";
  const text = `Hello ${name},\n\n we regret you to inform that your transaction of $${amount} to account ${toAccount} was failed.\n\nBest regards,\n The Backend Ledger Team`;
  const html = `<p>Hello ${name},</p>
                <p>we regret you to inform that your transaction of $${amount} to account ${toAccount} was failed. </p>              
                <p>Best regards,</br> The Backend Ledger Team</p>`;
  
  await sendMail(userEmail,subject,text,html)
}

module.exports = {sendRegestrationEmail, sendTransactionEmail, sendTransactionFailureEmail };