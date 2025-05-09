const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { isUser } = require('../middlewares/authMiddleware');

// ======================================
// 📚 User Dashboard
// ======================================
router.get('/dashboard', isUser, bookController.dashboard);

// ======================================
// 📖 User History & Bookmarks
// ======================================
router.get('/borrow-history', isUser, bookController.viewBorrowHistory);
router.get('/bookmarks', isUser, bookController.viewBookmarks);

// ======================================
// 🔖 Bookmark Book
// ======================================
router.post('/bookmark/:id', isUser, bookController.toggleBookmark);

// ======================================
// 📤 Borrow & Return Book
// ======================================
router.post('/borrow/:id', isUser, bookController.borrowBook);
router.post('/return/:id', isUser, bookController.returnBook);

module.exports = router;
