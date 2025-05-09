const bcrypt = require('bcryptjs');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');

// ✅ SweetAlert Helper
const sweetAlert = (icon, title, text, redirect = '/profile') => `
<!DOCTYPE html>
<html><head><script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script></head>
<body>
  <script>
    Swal.fire({
      icon: '${icon}',
      title: '${title}',
      text: '${text}'
    }).then(() => window.location.href = '${redirect}');
  </script>
</body></html>
`;

// ✅ Show Profile Page
exports.showProfile = async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id);
    res.render('pages/profile', { user });
  } catch (err) {
    console.error('[ShowProfile Error]', err);
    res.send('Error loading profile page');
  }
};

// ✅ Update Name/Email
exports.updateProfile = async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.send(sweetAlert('warning', 'Missing Fields', 'Please enter both name and email.'));
  }

  try {
    await User.findByIdAndUpdate(req.session.user.id, { name, email });
    req.session.user.name = name;
    req.session.user.email = email;
    res.send(sweetAlert('success', 'Updated!', 'Your profile info has been updated.'));
  } catch (error) {
    console.error('[UpdateProfile Error]', error);
    res.send(sweetAlert('error', 'Update Failed', 'Something went wrong. Please try again.'));
  }
};

// ✅ Change Password
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  try {
    const user = await User.findById(req.session.user.id);

    if (!await bcrypt.compare(currentPassword, user.password)) {
      return res.send(sweetAlert('error', 'Wrong Password!', 'Your current password is incorrect.'));
    }

    if (newPassword !== confirmPassword) {
      return res.send(sweetAlert('warning', 'Mismatch!', 'New password and confirmation do not match.'));
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.send(sweetAlert('info', 'Weak Password', 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.'));
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.send(sweetAlert('success', 'Password Updated!', 'Your password was changed successfully.'));
  } catch (err) {
    console.error('[ChangePassword Error]', err);
    res.send(sweetAlert('error', 'Error', 'Something went wrong while updating your password.'));
  }
};

// ✅ Upload Profile Picture
exports.uploadProfilePic = async (req, res) => {
  try {
    if (!req.file) {
      return res.send(sweetAlert('info', 'No File Selected!', 'Please choose a profile picture before submitting.'));
    }

    const user = await User.findById(req.session.user.id);

    // Save path and update session
    user.profilePic = `/images/${req.file.filename}`;
    await user.save();

    req.session.user.profilePic = user.profilePic;

    res.send(sweetAlert('success', 'Profile Picture Updated!', 'Your new profile picture has been saved.'));
  } catch (err) {
    console.error('[UploadProfilePic Error]', err);
    res.send(sweetAlert('error', 'Upload Failed', 'Something went wrong. Please try again.'));
  }
};
