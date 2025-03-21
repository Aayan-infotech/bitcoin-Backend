const nodemailer = require("nodemailer");
require("dotenv").config(); // Load environment variables

const sendEmail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail", 
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, 
      },
      tls:{
        rejectUnauthorized: false
      }
    });

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    };

  await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(403).json({
      success: false,
      message: "Failed while sending email",
    });
  }
};

// Correctly exporting the function
module.exports = sendEmail;
