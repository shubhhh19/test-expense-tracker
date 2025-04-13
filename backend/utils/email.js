const nodemailer = require('nodemailer');

let transporter;

// Check if SMTP is configured
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
} else {
  console.warn('SMTP not configured. Emails will be logged but not sent.');
}

const sendEmail = async ({ to, subject, html }) => {
  try {
    // If SMTP is not configured, just log the email
    if (!transporter) {
      console.log('Email would be sent:');
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Content: ${html}`);
      return { messageId: 'email-logged', success: true };
    }

    const info = await transporter.sendMail({
      from: `"Expense Tracker" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    // Don't throw the error, just log it
    return { error: error.message, success: false };
  }
};

module.exports = sendEmail; 