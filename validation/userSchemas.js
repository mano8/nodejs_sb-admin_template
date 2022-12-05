/**
 * This file contain all validation schema for user model.
 * 
 * Ordered by form name.
 * 
 * 
 * ToDo: Need control valid chars of firstName, lastName
 */
const { Types } = require('mongoose');
const User = require('../models/User');
const Utils = require('../utils/utils.js');
const utils = new Utils();

//-> registration form validation
const registrationSchema = {
  username: {
    custom: {
      options: value => {
        return User.find({username: value})
          .then(user => {
              if (user.length > 0) {
                  return Promise.reject('Username already in use')
              }

              if(!utils.iskey(value)){
                return Promise.reject('Invalid username, field must contain only alphanumeric characters and `_`')
              }
          })
      }
    },
    isString: { errorMessage: "Username should be string" },
    exists: { errorMessage: "Username is required" },
    trim: true,
    escape: true,
  },
  firstName: {
    notEmpty: [true, "First Name field cannot be empty"],
    isString: { errorMessage: "First Name should be string" },
    exists: { errorMessage: "First Name is required" },
    trim: true,
    escape: true,
  },
  lastName: {
    notEmpty: [true, "Last Name field cannot be empty"],
    isString: { errorMessage: "Last Name should be string" },
    exists: { errorMessage: "Last Name is required" },
    trim: true,
    escape: true,
  },
  email: {
    custom: {
        options: value => {
            return User.find({
                email: value
            }).then(user => {
                if (user.length > 0) {
                    return Promise.reject('Email address already taken')
                }

                if(!utils.isEmailChars(value)){
                  return Promise.reject('Invalid email, field must contain only alphanumeric and [a-z0-9._\-@] characters.')
                }
            })
        }
    },
    isEmail: {errorMessage: "Email is not valid."},
    isString: { errorMessage: "Email should be string" },
    exists: { errorMessage: "Email is required" },
    normalizeEmail: true,
    trim: true,
    escape: true,  
  },
  password: {
    isStrongPassword: {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        errorMessage: "Password must be greater than 8 and contain at least one uppercase letter, one lowercase letter, and one number"
    },
    custom: {
      options: value => {
        return utils.isPasswordChars(value)
      },
      errorMessage: 'Invalid password, field must contain only alphanumeric and [./_-@#$%+] characters'
    },
    isString: { errorMessage: "Password should be string" },
    exists: { errorMessage: "Password is required" },
    trim: true,
    escape: true,
  },
  passwordControl: {
    custom: {
      options: (value, params) => {
        //-> escape password can be result a false positive
        if (!utils.isPasswordChars(value)){
          params.errorMessage = 'Invalid Confirmation password, field must contain only alphanumeric and [./_-@#$%+] characters';
          return false;
        }

        if (value !== params.req.body.password){
          params.errorMessage = "Passwords do not match";
          return false;
        }
        return true;
      },
      errorMessage: (value, params) => {
        if (params.errorMessage) {
          return params.errorMessage
        }
        return 'Confirmation password Error'
      }
    },
    isString: { errorMessage: "Confirmation password should be string" },
    exists: { errorMessage: "Confirmation password is required" },
    trim: true,
    escape: true,
    
  }
}


/**
 * Edit profile form validation schema
 */
 const editProfileSchema = {
  _id: {
    custom: {
      options: (value, { req }) => {
          return User.findOne({
            _id: Types.ObjectId(req.body._id)
            })
              .then((user) => {
                  if (!utils.isObject(user) || user === {}) {
                      return Promise.reject('Fatal Error, unable to find the user id.')
                  }
              })
      }
    },
    isString: { errorMessage: "User id should be string" },
    exists: { errorMessage: "User id is required" },
    trim: true,
    customSanitizer: {
      options: (value) => {
        return Types.ObjectId(value);
      }
    }
  },
  username: registrationSchema.username,
  firstName: registrationSchema.firstName,
  lastName: registrationSchema.lastName,
  email: registrationSchema.email
}
  
  
/**
 * Edit Password form validation schema
 */
const editPasswordSchema = {
  _id: editProfileSchema._id,
  oldPassword: {
    custom: {
      options: (value, { req }) => {
          return User.findOne({
            _id: req.body._id
            })
              .then((user) => {
                  if (!user || !bcrypt.compareSync(req.body.password, user.password)) {
                      return Promise.reject('Error, please verrify your old password.')
                  }
              })
      }
    },
    isString: { errorMessage: "Old Password should be string" },
    exists: { errorMessage: "Old Password id is required" },
    trim: true,
    escape: true,
  },
  password: registrationSchema.password,
  passwordControl: registrationSchema.passwordControl
}

/**
 * Edit Avatar form validation schema
 */
 const editAvatarSchema = {
  _id: editProfileSchema._id,
  photo: {
    custom: {
      options: (value, { req }) => {
          return User.findOne({
            _id: req.body._id
            })
              .then((user) => {
                  if (!user || !bcrypt.compareSync(req.body.password, user.password)) {
                      return Promise.reject('Error, please verrify your actual password.')
                  }
              })
      }
    }
  }
}

/**
 * Forgot Password form validation schema
 */
 const forgotSchema = {
  _id: editProfileSchema._id,
  email: registrationSchema.email,
}

/**
 * Login form validation schema
 */
 const loginSchema = {
  username: {
    exists: { errorMessage: "Username is required" },
    isString: { errorMessage: "Username should be string" },
    custom: {
      options: value => {
        return utils.iskey(value)
      },
      errorMessage: "Invalid username, field must contain only alphanumeric characters and `_`"
    },
    trim: true,
    escape: true,
  },
  password: registrationSchema.password,
}

exports.registrationSchema = registrationSchema;
exports.editProfileSchema = editProfileSchema;
exports.editPasswordSchema = editPasswordSchema;
exports.editAvatarSchema = editAvatarSchema;
exports.forgotSchema = forgotSchema;
exports.loginSchema = loginSchema;