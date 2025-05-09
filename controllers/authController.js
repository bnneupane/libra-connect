const bcrypt = require('bcryptjs');
const User = require('../models/User');
const nodemailer = require('nodemailer');

// 📄 OTP store using session
const otpTTL = 10 * 60 * 1000; // 10 minutes

// ✅ SweetAlert Template
const sweetAlertPage = (title, text, icon, redirectURL) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
</head>
<body>
  <script>
    Swal.fire({
      icon: '${icon}',
      title: '${title}',
      text: '${text}',
      confirmButtonText: 'OK'
    }).then(() => window.location.href = '${redirectURL}');
  </script>
</body>
</html>`;

// ========== 🔐 OTP HANDLING ==========
exports.sendOTP = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.send(`<script>alert('No user found with this email'); window.location.href='/auth/forgot-password';</script>`);
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  req.session.resetEmail = email;
  req.session.otp = otp;
  req.session.otpExpiry = Date.now() + otpTTL;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    }
  });

  await transporter.sendMail({
    from: '"Libra Connect 🔐" <bnneupane2001@gmail.com>',
    to: email,
    subject: '🔐 Your OTP for Password Reset',
    html: `
      <div style="font-family:'Segoe UI', sans-serif; max-width:600px; margin:auto; padding:30px; border:1px solid #eee; border-radius:10px; background-color:#f9f9f9;">
        <h2 style="text-align:center; color:#0d6efd;">🔐 Libra Connect</h2>
        <p>You requested to reset your password. Use the OTP below:</p>
        <div style="font-size:22px; text-align:center; margin:20px 0; padding:15px; background:#e9f3ff; border-radius:8px; color:#0d6efd; letter-spacing:4px;">
          <strong>${otp}</strong>
        </div>
        <p>OTP is valid for <strong>10 minutes</strong>.</p>
        <p>If you didn't request this, ignore the email.</p>
        <p style="font-size:14px; color:#888;">— Team Libra Connect 📚</p>
      </div>`
  });

  res.redirect('/auth/reset-password');
};

exports.resetPassword = async (req, res) => {
  const { otp, newPassword, confirmPassword } = req.body;
  const { otp: storedOtp, otpExpiry, resetEmail } = req.session;

  if (!storedOtp || !otpExpiry || !resetEmail || Date.now() > otpExpiry) {
    return res.send(`<script>alert('OTP expired or invalid session. Try again.'); window.location.href='/auth/forgot-password';</script>`);
  }

  if (otp !== storedOtp) {
    return res.send(`<script>alert('Invalid OTP'); window.location.href='/auth/reset-password';</script>`);
  }

  const strongPwd = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
  if (!strongPwd.test(newPassword)) {
    return res.send(`<script>alert('Password must be 8+ chars with uppercase, number, and symbol.'); window.location.href='/auth/reset-password';</script>`);
  }

  if (newPassword !== confirmPassword) {
    return res.send(`<script>alert('Passwords do not match'); window.location.href='/auth/reset-password';</script>`);
  }

  const hashed = await bcrypt.hash(newPassword, 12);
  await User.findOneAndUpdate({ email: resetEmail }, { password: hashed });

  req.session.otp = req.session.otpExpiry = req.session.resetEmail = null;

  res.send(`<script>alert('Password updated successfully!'); window.location.href='/auth/login';</script>`);
};

// ========== FORMS ==========
exports.showForgotPasswordForm = (req, res) => {
  res.render('pages/forgotPassword');
};

exports.showResetPasswordForm = (req, res) => {
  if (!req.session.resetEmail) return res.redirect('/auth/forgot-password');
  res.render('pages/resetPassword');
};

exports.showRegisterForm = (req, res) => {
  res.sendFile('register.html', { root: './views/pages' });
};

exports.showLoginForm = (req, res) => {
  res.sendFile('login.html', { root: './views/pages' });
};

// ========== REGISTER ==========
exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.send(sweetAlertPage('Already Registered', 'An account with this email already exists.', 'error', '/auth/login'));
  }

  const validations = [
    { regex: /.{8,}/, msg: 'at least 8 characters' },
    { regex: /[A-Z]/, msg: 'one uppercase letter' },
    { regex: /[a-z]/, msg: 'one lowercase letter' },
    { regex: /\d/, msg: 'one number' },
    { regex: /[!@#$%^&*(),.?":{}|<>]/, msg: 'one special character' },
  ];

  for (const { regex, msg } of validations) {
    if (!regex.test(password)) {
      return res.send(sweetAlertPage('Password Issue', `Password must have ${msg}.`, 'error', '/auth/register'));
    }
  }

  if (password.toLowerCase().includes(name.toLowerCase())) {
    return res.send(sweetAlertPage('Password Issue', 'Password cannot contain your name.', 'error', '/auth/register'));
  }

  const hashed = await bcrypt.hash(password, 10);
  await new User({ name, email, password: hashed }).save();

  res.send(sweetAlertPage('Success!', 'You can now login.', 'success', '/auth/login'));
};

// ========== LOGIN ==========
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.send(sweetAlertPage('User Not Found', 'No account exists with this email.', 'error', '/auth/register'));
    }

    if (user.isSuspended) {
      return res.send(sweetAlertPage('Suspended!', 'Your account has been suspended.', 'warning', '/auth/login'));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.send(sweetAlertPage('Wrong Password!', 'Incorrect password entered.', 'error', '/auth/login'));
    }

    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      profilePic: user.profilePic
    };

    res.redirect(user.isAdmin ? '/admin/dashboard' : '/books/dashboard');

  } catch (err) {
    console.error('[Login Error]', err);
    res.send('Server error during login.');
  }
};

// ========== LOGOUT ==========
exports.logoutUser = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/auth/login');
  });
};

// ========== OPTIONAL: NOTIFICATIONS (Admin Use Only) ==========
exports.sendNotification = async (req, res) => {
  try {
    const users = await User.find();
    for (const user of users) {
      user.notifications.push({
        message: req.body.message,
        date: new Date(),
        seen: false
      });
      await user.save();
    }
    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error('[Notification Error]', err);
    res.send('Error sending notifications.');
  }
};
