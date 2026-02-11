const nodemailer = require("nodemailer");

// Create transporter using Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendMail(toEmail) {
  try {
    await transporter.sendMail({
      from: `"Big City Live" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: "Welcome to Big City Live!",
      text: "Welcome to Big City Live!"
    });

    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

module.exports = { sendMail };
