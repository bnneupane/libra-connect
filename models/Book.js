const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    index: true // for faster search
  },
  author: {
    type: String,
    required: true,
    trim: true
  },
  genre: {
    type: String,
    required: true,
    trim: true
  },
  copiesAvailable: {
    type: Number,
    default: 1,
    min: 0
  },
  imageURL: {
    type: String,
    default: '/images/default_book_cover.png'
  },
  ratings: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      review: {
        type: String,
        trim: true
      }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Book', BookSchema);
