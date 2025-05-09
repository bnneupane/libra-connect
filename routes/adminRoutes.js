const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const adminController = require('../controllers/adminController');
const { isAdmin } = require('../middlewares/authMiddleware');

// ✅ Multer Config: Profile Picture Upload
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, 'public/images'),
  filename: (_, file, cb) => cb(null, 'admin_' + Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// ======================================
// 📊 Admin Dashboard
// ======================================
router.get('/dashboard', isAdmin, adminController.adminDashboard);

// ======================================
// 📚 Book Management
// ======================================
router.get('/books', isAdmin, adminController.manageBooks);
router.get('/books/create', isAdmin, adminController.showCreateForm);
router.post('/books/create', isAdmin, adminController.createBook);
router.get('/books/edit/:id', isAdmin, adminController.showEditForm);
router.post('/books/edit/:id', isAdmin, adminController.updateBook);
router.post('/books/delete/:id', isAdmin, adminController.deleteBook);

// ======================================
// 👥 User Management
// ======================================
router.get('/users', isAdmin, adminController.manageUsers);
router.post('/users/suspend/:id', isAdmin, adminController.toggleSuspendUser);
router.post('/users/promote/:id', isAdmin, adminController.togglePromoteUser);

// ======================================
// 🔔 Notifications
// ======================================
router.get('/notifications', isAdmin, adminController.showNotificationForm);
router.post('/notifications', isAdmin, adminController.sendNotification);
router.get('/notifications/history', isAdmin, adminController.viewNotificationHistory);

// ======================================
// 👤 Admin Profile Management
// ======================================
router.get('/profile', isAdmin, adminController.showAdminProfile);
router.post('/profile/update', isAdmin, adminController.updateAdminProfile);
router.post('/profile/change-password', isAdmin, adminController.changeAdminPassword);
router.post('/profile/upload-photo', isAdmin, upload.single('profilePic'), adminController.uploadAdminPhoto);

module.exports = router;
