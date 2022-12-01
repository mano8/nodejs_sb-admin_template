const mongoose = require('mongoose');
const bcryptjs = require('bcrypt');

//-> see: https://stackoverflow.com/questions/61688724/what-is-the-difference-between-mongoose-validation-and-using-express-validator
//-> validate data before save or update
let userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
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
    required: true,
  },
  photo: {
    type: String
  },
  created_on: {
    type: String,
    default: Date.now,
  },
  updated_on: {
    type: String,
    default: Date.now,
  },
  last_login: {
    type: String,
    default: Date.now,
  },
  login_count: {
    type: Number,
    default: 1
  }
});

//hash password before saving to database
userSchema.pre('save', function (next) {
 var user = this; 
  bcryptjs.hash(user.password, 12, function (err, hash) {
      if (err) {
          return next(err);
      }
      user.password = hash;
      next();
  })
});

let User = mongoose.model('User', userSchema);

module.exports = User;