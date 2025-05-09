const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const profileController = require('../controllers/profileController');
const { isUser } = require('../middlewares/authMiddleware');
const User = require('../models/User');

// ======================================
// 🖼️ Multer Config: User Profile Picture Upload
// ======================================
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, 'public/images'),
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `user_${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

// ======================================
// 👤 User Profile Routes
// ======================================
router.get('/', isUser, profileController.showProfile);
router.post('/update', isUser, profileController.updateProfile);
router.post('/change-password', isUser, profileController.changePassword);
router.post('/upload-photo', isUser, upload.single('profilePic'), profileController.uploadProfilePic);

// ======================================
// 🔔 View Notifications
// ======================================
router.get('/notifications', isUser, async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id);
    user.notifications.forEach(n => n.seen = true);
    await user.save();

    res.render('pages/notifications', { notifications: user.notifications });
  } catch (err) {
    console.error('[Notifications Fetch Error]', err);
    res.send('Error loading notifications');
  }
});

module.exports = router;
