const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: { user: process.env.SMTP_EMAIL, pass: process.env.SMTP_PASSWORD }
  });
};

const templates = {
  emailVerification: ({ name, verifyUrl }) => ({
    subject: 'Welcome to LuxeMart - Verify Your Email',
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#fff;padding:40px;border-radius:16px">
      <h1 style="color:#d4af37;font-size:28px">Welcome to LuxeMart, ${name}!</h1>
      <p style="color:#ccc">Please verify your email address to get started.</p>
      <a href="${verifyUrl}" style="display:inline-block;background:linear-gradient(135deg,#d4af37,#f5cc5a);color:#000;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;margin:24px 0">Verify Email</a>
      <p style="color:#888;font-size:12px">Link expires in 24 hours.</p>
    </div>`
  }),
  passwordReset: ({ name, resetUrl }) => ({
    subject: 'LuxeMart - Password Reset Request',
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#fff;padding:40px;border-radius:16px">
      <h1 style="color:#d4af37">Password Reset</h1>
      <p style="color:#ccc">Hi ${name}, click below to reset your password:</p>
      <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#d4af37,#f5cc5a);color:#000;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;margin:24px 0">Reset Password</a>
      <p style="color:#888;font-size:12px">Link expires in 10 minutes. If you didn't request this, ignore this email.</p>
    </div>`
  }),
  orderConfirmation: ({ order }) => ({
    subject: `Order Confirmed - ${order.orderId}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#fff;padding:40px;border-radius:16px">
      <h1 style="color:#d4af37">Order Confirmed! 🎉</h1>
      <p style="color:#ccc">Order ID: <strong style="color:#d4af37">${order.orderId}</strong></p>
      <p style="color:#ccc">Total: <strong>₹${order.pricing.total.toLocaleString('en-IN')}</strong></p>
      <p style="color:#888;font-size:14px">We'll notify you when your order ships.</p>
    </div>`
  })
};

exports.sendEmail = async ({ email, subject, template, data, html }) => {
  const transporter = createTransporter();
  const templateContent = template && templates[template] ? templates[template](data) : {};
  const mailOptions = {
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    to: email,
    subject: subject || templateContent.subject,
    html: html || templateContent.html
  };
  await transporter.sendMail(mailOptions);
};
