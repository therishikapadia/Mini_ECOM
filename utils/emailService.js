const nodemailer = require('nodemailer');

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Send welcome email
async function sendWelcomeEmail(userEmail, name) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: 'Welcome to Our Platform',
      html: `
        <h1>Welcome ${name}!</h1>
        <p>Thank you for registering with us.</p>
      `
    });
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
}

// Send password reset email
async function sendPasswordResetEmail(userEmail, resetToken) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: 'Password Reset Request',
      html: `
        <h1>Password Reset</h1>
        <p>Click the link below to reset your password:</p>
        <a href="${process.env.APP_URL}/reset-password/${resetToken}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
      `
    });
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
}

module.exports = {
  sendWelcomeEmail,
  sendPasswordResetEmail
};
