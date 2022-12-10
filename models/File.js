const mongoose = require('mongoose');

let fileSchema = new mongoose.Schema({
    filename: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    ext: {
      type: String,
      required: true,
      trim: true
    },
    title: {
      type: String,
      trim: true
    },
    alt: {
      type: String,
      trim: true
    },
    size: {
      type: Number,
      required: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    created_by: {
      type: String,
      required: true,
    },
    updated_by: {
      type: String,
      default: Date.now,
    },
    created_on: {
      type: String,
      default: Date.now,
    },
    updated_on: {
      type: String,
      default: Date.now,
    }
  });
  
  let File = mongoose.model('File', fileSchema);
  
  module.exports = File;