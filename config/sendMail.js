const nodemailer = require("nodemailer");
require("dotenv").config();
const { getSecrets } = require("../config/awsSecrets");

let secretsCache = null;

async function init() {
  if (!secretsCache) {
    secretsCache = await getSecrets();
  }
}

const sendEmail = async (to, subject, html) => {
  try {
    await init();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: secretsCache.EMAIL_USER || process.env.EMAIL_USER,
        pass: secretsCache.EMAIL_PASS || process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },  
    });

    const mailOptions = {
      from: "Bitcoin wallet",
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = sendEmail;
