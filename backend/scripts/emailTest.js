#!/usr/bin/env node
/*
 Quick SMTP test for OTP email.
 Usage (PowerShell):
   set SMTP_SERVICE=gmail; set SMTP_USER=you@gmail.com; set SMTP_PASS=app-password; node scripts/emailTest.js you@gmail.com
 or with custom host:
   set SMTP_HOST=smtp.gmail.com; set SMTP_PORT=587; set SMTP_USER=you@gmail.com; set SMTP_PASS=app-password; node scripts/emailTest.js dest@example.com
*/
const nodemailer = require('nodemailer');
(async () => {
  try {
    const to = process.argv[2] || process.env.SMTP_USER;
    if (!to) {
      console.error('Provide recipient email as arg or set SMTP_USER');
      process.exit(1);
    }
    let transporter;
    if (process.env.SMTP_SERVICE) {
      transporter = nodemailer.createTransport({
        service: process.env.SMTP_SERVICE,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      });
    } else if (process.env.SMTP_HOST) {
      const port = Number(process.env.SMTP_PORT || 587);
      const secure = process.env.SMTP_SECURE === '1' || port === 465;
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      });
    } else {
      console.error('Set either SMTP_SERVICE or SMTP_HOST variables first.');
      process.exit(1);
    }
    const otp = Math.floor(100000 + Math.random()*900000).toString();
    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM || `Test <${process.env.SMTP_USER}>`,
      to,
      subject: 'SMTP Test OTP',
      text: `Test OTP is ${otp}`,
      html: `<p>Test OTP is <b>${otp}</b></p>`
    });
    console.log('Sent message id:', info.messageId);
    console.log('Done. Check inbox (and spam).');
  } catch (e) {
    console.error('Email test failed:', e.message);
    process.exit(1);
  }
})();
