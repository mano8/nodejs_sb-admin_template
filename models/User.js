const mongoose = require('mongoose')
const validator = require('validator')
const bcryptjs = require('bcrypt')

//-> ToDo: Remove validator use only express-validator before execute request on model
//-> see: https://stackoverflow.com/questions/61688724/what-is-the-difference-between-mongoose-validation-and-using-express-validator
let userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: value => validator.isAlphanumeric(value),
      message: props => `${props.value} is not a valid username!`
    }
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: value => validator.isAlphanumeric(value),
      message: props => `${props.value} is not a valid first name!`
    }
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
    validate: {
      validator: value => validator.isEmail(value),
      message: props => `${props.value} is not a valid email!`
    }
  },
  password: {
    type: String,
    required: true,
  },
  photo: {
    type: String,
    validate: {
      validator: value => validator.isDataURI(value),
      message: props => `${props.value} is not a valid image url!`
    }
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