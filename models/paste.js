const mongoose = require("mongoose");

const pasteSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: null
  },
  maxViews: {
    type: Number,
    default: null
  },
  views: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model("Paste", pasteSchema);
