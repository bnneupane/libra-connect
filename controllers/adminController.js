const Book = require('../models/Book');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

// Helper: SweetAlert HTML
const sweetAlertPage = (title, text, icon, redirectURL) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
  <title>${title}</title>
</head>
<body>
  <script>
    Swal.fire({ icon: '${icon}', title: '${title}', text: '${text}', confirmButtonText: 'OK' })
    .then(() => window.location.href = '${redirectURL}');
  </script>
</body>
</html>`;

// ========== 📊 DASHBOARD ==========
exports.adminDashboard = async (req, res) => {
  try {
    const books = await Book.find();
    const users = await User.find().populate('borrowedBooks.bookId');

    const totalBooks = books.length;
    const totalUsers = users.length;
    const activeBorrowed = users.reduce(
      (count, user) => count + user.borrowedBooks.filter(b => !b.returnDate).length,
      0
    );

    res.render('pages/adminDashboard', {
      user: req.session.user,
      totalBooks,
      totalUsers,
      activeBorrowed,
      users
    });
  } catch (err) {
    console.error('[Dashboard Error]', err);
    res.send('Error loading Admin Dashboard');
  }
};

// ========== 📚 BOOK MANAGEMENT ==========
exports.manageBooks = async (req, res) => {
  try {
    const books = await Book.find();
    res.render('pages/manageBooks', { books, user: req.session.user });
  } catch (err) {
    console.error('[Manage Books Error]', err);
    res.send('Error loading books');
  }
};

exports.showCreateForm = (req, res) => {
  res.render('pages/createBook', { user: req.session.user });
};

exports.createBook = async (req, res) => {
  try {
    await new Book(req.body).save();
    res.send(sweetAlertPage('Book Added!', 'The book has been successfully added.', 'success', '/admin/books'));
  } catch (err) {
    console.error('[Create Book Error]', err);
    res.send(sweetAlertPage('Failed!', 'Error adding book.', 'error', '/admin/books/create'));
  }
};

exports.showEditForm = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    res.render('pages/editBook', { book, user: req.session.user });
  } catch (err) {
    console.error('[Edit Book Form Error]', err);
    res.send('Error loading book for editing');
  }
};

exports.updateBook = async (req, res) => {
  try {
    await Book.findByIdAndUpdate(req.params.id, req.body);
    res.send(sweetAlertPage('Updated!', 'Book updated successfully.', 'success', '/admin/books'));
  } catch (err) {
    console.error('[Update Book Error]', err);
    res.send(sweetAlertPage('Update Failed!', 'Error updating book.', 'error', `/admin/books/edit/${req.params.id}`));
  }
};

exports.deleteBook = async (req, res) => {
  try {
    await Book.findByIdAndDelete(req.params.id);
    res.send(sweetAlertPage('Deleted!', 'Book removed successfully.', 'success', '/admin/books'));
  } catch (err) {
    console.error('[Delete Book Error]', err);
    res.send(sweetAlertPage('Failed!', 'Error deleting book.', 'error', '/admin/books'));
  }
};

// ========== 👥 USER MANAGEMENT ==========
exports.manageUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.render('pages/manageUsers', { users, user: req.session.user });
  } catch (err) {
    console.error('[Manage Users Error]', err);
    res.send('Error loading users');
  }
};

exports.toggleSuspendUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user.isSuspended = !user.isSuspended;
    await user.save();

    const msg = user.isSuspended ? 'Suspended' : 'Reactivated';
    res.send(sweetAlertPage(`User ${msg}`, `User has been ${msg.toLowerCase()}.`, 'success', '/admin/users'));
  } catch (err) {
    console.error('[Suspend User Error]', err);
    res.send(sweetAlertPage('Error!', 'Failed to update user status.', 'error', '/admin/users'));
  }
};

exports.togglePromoteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user.isAdmin = !user.isAdmin;
    await user.save();

    const msg = user.isAdmin ? 'Promoted to Admin' : 'Demoted to User';
    res.send(sweetAlertPage(msg, 'User role updated.', 'success', '/admin/users'));
  } catch (err) {
    console.error('[Promote/Demote Error]', err);
    res.send(sweetAlertPage('Error!', 'Failed to change user role.', 'error', '/admin/users'));
  }
};

// ========== 🔔 NOTIFICATIONS ==========
exports.showNotificationForm = (req, res) => {
  res.render('pages/sendNotification', { user: req.session.user });
};

exports.sendNotification = async (req, res) => {
  try {
    const message = req.body.message?.trim();
    if (!message) {
      return res.send(sweetAlertPage('Empty Message!', 'Enter a message before sending.', 'warning', '/admin/notifications'));
    }

    const users = await User.find();
    for (let user of users) {
      user.notifications.push({ message, date: new Date(), seen: false });
      await user.save();
    }

    res.send(sweetAlertPage('Sent!', 'Notification sent to all users.', 'success', '/admin/dashboard'));
  } catch (err) {
    console.error('[Send Notification Error]', err);
    res.send(sweetAlertPage('Failed!', 'Could not send notification.', 'error', '/admin/notifications'));
  }
};



exports.viewNotificationHistory = async (req, res) => {
  try {
    const users = await User.find();
    const uniqueMap = new Map();

    users.forEach(user =>
      user.notifications.forEach(n => {
        const key = `${n.message.trim()}-${new Date(n.date).toISOString().split('.')[0]}`;
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, { message: n.message.trim(), date: new Date(n.date) });
        }
      })
    );

    const notifications = [...uniqueMap.values()].sort((a, b) => b.date - a.date);
    res.render('pages/adminNotificationHistory', { notifications });
  } catch (err) {
    console.error('[View Notification History Error]', err);
    res.send('Error loading notification history');
  }
};

// ========== 👤 PROFILE MANAGEMENT ==========
exports.showAdminProfile = async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id);
    res.render('pages/adminProfile', { user });
  } catch (err) {
    console.error('[Show Profile Error]', err);
    res.send('Error loading admin profile');
  }
};

exports.updateAdminProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      req.session.flash = { type: 'warning', msg: 'Fields cannot be empty.' };
      return res.redirect('/admin/profile');
    }

    await User.findByIdAndUpdate(req.session.user.id, { name, email });
    Object.assign(req.session.user, { name, email });

    req.session.flash = { type: 'success', msg: 'Profile updated successfully.' };
    res.redirect('/admin/profile');
  } catch (err) {
    console.error('[Update Profile Error]', err);
    req.session.flash = { type: 'error', msg: 'Failed to update profile.' };
    res.redirect('/admin/profile');
  }
};

exports.changeAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const user = await User.findById(req.session.user.id);

    if (!await bcrypt.compare(currentPassword, user.password)) {
      req.session.flash = { type: 'error', msg: 'Incorrect current password.' };
      return res.redirect('/admin/profile');
    }

    if (newPassword !== confirmPassword) {
      req.session.flash = { type: 'warning', msg: 'Passwords do not match.' };
      return res.redirect('/admin/profile');
    }

    const strongPassword = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+[\]{};':"\\|,.<>?]).{8,}$/;
    if (!strongPassword.test(newPassword)) {
      req.session.flash = {
        type: 'info',
        msg: 'Password must include uppercase, number, symbol, and 8+ characters.'
      };
      return res.redirect('/admin/profile');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    req.session.flash = { type: 'success', msg: 'Password changed successfully!' };
    res.redirect('/admin/profile');
  } catch (err) {
    console.error('[Change Password Error]', err);
    req.session.flash = { type: 'error', msg: 'Failed to change password.' };
    res.redirect('/admin/profile');
  }
};

exports.uploadAdminPhoto = async (req, res) => {
  try {
    if (!req.file) {
      req.session.flash = { type: 'warning', msg: 'No file selected.' };
      return res.redirect('/admin/profile');
    }

    const allowed = ['image/jpeg', 'image/png'];
    if (!allowed.includes(req.file.mimetype) || req.file.size > 1 * 1024 * 1024) {
      fs.unlinkSync(req.file.path);
      req.session.flash = { type: 'warning', msg: 'Only JPG/PNG under 1MB allowed.' };
      return res.redirect('/admin/profile');
    }

    const user = await User.findById(req.session.user.id);
    user.profilePic = `/images/${req.file.filename}`;
    await user.save();

    req.session.user.profilePic = user.profilePic;
    req.session.flash = { type: 'success', msg: 'Profile picture updated!' };
    res.redirect('/admin/profile');
  } catch (err) {
    console.error('[Upload Photo Error]', err);
    req.session.flash = { type: 'error', msg: 'Upload failed!' };
    res.redirect('/admin/profile');
  }
};
