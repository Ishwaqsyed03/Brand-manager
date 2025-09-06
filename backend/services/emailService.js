const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', // You can change this to your email provider
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});


const sendResetEmail = async (to, resetLink) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Password Reset Request',
    html: `<p>You requested a password reset. Click <a href="${resetLink}">here</a> to reset your password. This link will expire in 1 hour.</p>`
  };
  await transporter.sendMail(mailOptions);
};

const sendVerificationEmail = async (to, verifyLink) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Verify your email address',
    html: `<p>Welcome! Please verify your email by clicking <a href="${verifyLink}">here</a>. This link will expire in 1 hour.</p>`
  };
  await transporter.sendMail(mailOptions);
};

module.exports = { sendResetEmail, sendVerificationEmail };
