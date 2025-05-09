const Book = require('../models/Book');
const User = require('../models/User');

// ✅ Helper: SweetAlert Response Generator
const sweetAlert = (icon, title, text, redirectURL) => `
<html>
<head><script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script></head>
<body>
  <script>
    Swal.fire({
      icon: '${icon}',
      title: '${title}',
      text: '${text}',
      confirmButtonText: 'OK'
    }).then(() => {
      window.location.href = '${redirectURL}';
    });
  </script>
</body>
</html>`;

// ========== 📊 User Dashboard ==========
exports.dashboard = async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id)
      .populate('borrowedBooks.bookId')
      .populate('bookmarks');
    const books = await Book.find();

    res.render('pages/dashboard', {
      user,
      books,
      totalBorrowed: user.borrowedBooks.length,
      activeBorrowed: user.borrowedBooks.filter(b => !b.returnDate).length,
      bookmarksCount: user.bookmarks.length
    });
  } catch (err) {
    console.error('[Dashboard Error]', err);
    res.send('Error loading dashboard');
  }
};

// ========== 🔖 Bookmark Toggle ==========
exports.toggleBookmark = async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id);
    const bookId = req.params.id;
    const isBookmarked = user.bookmarks.includes(bookId);

    if (isBookmarked) {
      user.bookmarks.pull(bookId);
    } else {
      user.bookmarks.push(bookId);
    }

    await user.save();

    const message = isBookmarked ? 'Book removed from bookmarks!' : 'Book added to your bookmarks!';
    const icon = isBookmarked ? 'info' : 'success';

    res.send(sweetAlert(icon, message, '', '/books/dashboard'));
  } catch (err) {
    console.error('[Bookmark Toggle Error]', err);
    res.send(sweetAlert('error', 'Error!', 'Failed to update bookmark. Try again later.', '/books/dashboard'));
  }
};

// ========== 📚 Borrow Book ==========
exports.borrowBook = async (req, res) => {
  const { id: bookId } = req.params;
  const userId = req.session.user.id;

  try {
    const user = await User.findById(userId);
    const alreadyBorrowed = user.borrowedBooks.some(b => b.bookId.toString() === bookId && !b.returnDate);

    if (alreadyBorrowed) {
      return res.send(sweetAlert('info', 'Already Borrowed!', 'You already borrowed this book.', '/books/dashboard'));
    }

    const book = await Book.findById(bookId);
    if (!book || book.copiesAvailable <= 0) {
      return res.send(sweetAlert('error', 'Unavailable', 'This book is not currently available.', '/books/dashboard'));
    }

    user.borrowedBooks.push({ bookId, borrowDate: new Date() });
    book.copiesAvailable--;

    await user.save();
    await book.save();

    res.send(sweetAlert('success', 'Book Borrowed!', 'Enjoy your reading.', '/books/dashboard'));
  } catch (err) {
    console.error('[Borrow Book Error]', err);
    res.send(sweetAlert('error', 'Oops!', 'Something went wrong.', '/books/dashboard'));
  }
};

// ========== 📤 Return Book ==========
exports.returnBook = async (req, res) => {
  const { id: bookId } = req.params;
  const userId = req.session.user.id;

  try {
    const user = await User.findById(userId);
    const borrowEntry = user.borrowedBooks.find(b => b.bookId.toString() === bookId && !b.returnDate);

    if (!borrowEntry) {
      return res.send(sweetAlert('warning', 'Return Failed', "You didn't borrow this book.", '/books/dashboard'));
    }

    borrowEntry.returnDate = new Date();
    await user.save();

    const book = await Book.findById(bookId);
    if (book) {
      book.copiesAvailable++;
      await book.save();
    }

    res.send(sweetAlert('success', 'Returned!', 'Book has been successfully returned.', '/books/dashboard'));
  } catch (err) {
    console.error('[Return Book Error]', err);
    res.send(sweetAlert('error', 'Oops!', 'Something went wrong.', '/books/dashboard'));
  }
};

// ========== 📖 Borrow History ==========
exports.viewBorrowHistory = async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id).populate('borrowedBooks.bookId');
    res.render('pages/borrowHistory', { user });
  } catch (err) {
    console.error('[Borrow History Error]', err);
    res.send('Error loading borrow history');
  }
};

// ========== 🔖 View Bookmarks ==========
exports.viewBookmarks = async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id).populate('bookmarks');
    res.render('pages/bookmarks', { user });
  } catch (err) {
    console.error('[Bookmarks View Error]', err);
    res.send('Error loading bookmarks');
  }
};
