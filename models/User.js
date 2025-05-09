const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  profilePic: {
    type: String,
    default: '/images/default-profile.png'
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  isSuspended: {
    type: Boolean,
    default: false
  },
  borrowedBooks: [{
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book'
    },
    borrowDate: {
      type: Date,
      required: true
    },
    returnDate: {
      type: Date
    }
  }],
  bookmarks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book'
  }],
  notifications: [{
    message: {
      type: String,
      trim: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    seen: {
      type: Boolean,
      default: false
    }
  }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
