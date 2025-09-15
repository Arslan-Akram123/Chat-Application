const nodemailer = require("nodemailer");

// Create a test account or replace with real credentials.
async function sendEmail(to,subject, text,html) {
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, 
  auth: {
    user: process.env.EMAIL_HOST,
    pass: process.env.EMAIL_PASS,
  },
});

// Wrap in an async IIFE so we can use await.
(async () => {
  const info = await transporter.sendMail({
    from: '"Fred Foo 👻" ',
    to: to, 
    subject: subject, 
    text: text, 
    html: html, 
  });

  console.log("Message sent:", info.messageId);
})()
};

module.exports = sendEmail;