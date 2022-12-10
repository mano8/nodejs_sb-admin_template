//js
var crypto = require("crypto");
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
var axios = require("axios");
const User = require('../models/User');
const {body, checkSchema, validationResult} = require('express-validator');
const Utils = require('../utils/utils.js');
const MulterHelper = require('../utils/multer.js');
const Gravatar = require('../utils/gravatar.js');
const fileController = require('./fileController.js')
let utils = new Utils();
let gravatar = new Gravatar();


let multerHelper = new MulterHelper();
multerHelper.setUpload('image', 'avatar');
exports.upload = multerHelper.upload;


const userData = {
    get_gravatar_hash: (email) => {
      return crypto.createHash('md5').update(email).digest("hex");
    },
    get_gravatar_user: (hash, done) => {
      axios
        .get("https://www.gravatar.com/"+hash+".xml")
        .then((res) => {
          const headerDate = res.headers && res.headers.date ? res.headers.date : 'no response date';
          console.log('[get_gravatar_user] Status Code:', res.status);
          console.log('[get_gravatar_user] Date in Response header:', headerDate);
          if (res && res.data){
            console.log("[get_gravatar_user] Got user: "+res.data);
            done(null, res.data);
          }else{
            console.log("[get_gravatar_user] Error no data retrieved. data : ", res);
            done({'error': "Error user data can't be found."}, null);
          }
        })
        .catch(err => {
          console.log('[get_gravatar_user] Error: ', err.message);
          done(err, null);
        });
    },
    get_gravatar_avatar: (hash, done) => {
      axios
        .get("https://www.gravatar.com/avatar/"+hash+".jpg?d=identicon")
        .then((res) => {
          const headerDate = res.headers && res.headers.date ? res.headers.date : 'no response date';
          console.log('[get_gravatar_avatar] Status Code:', res.status);
          console.log('[get_gravatar_avatar] Date in Response header:', headerDate);
          if (res && res.data){
            console.log("[get_gravatar_avatar] Got image: "+res.data);
            done(null, res.data);
          }else{
            console.log("[get_gravatar_avatar] Error no data retrieved. data : ", res);
            done({'error': "Error avatar can't be found."}, null);
          }
      })
      .catch(err => {
        console.log('[get_gravatar_avatar] Error: ', err.message);
        done(err, null);
      });
    },
    get_user_avatar: (email, done) => {
      if( email ){
        let hash = userData.get_gravatar_hash(email);
        userData.get_gravatar_avatar(hash, (err, avatar) => done(err, avatar))
      }
      else{
        done({'error': 'Email is undefined or invalid.'})
      }
    },
    get_keys: () => {
      return [
        '_id', 'username', 'firstName', 'lastName',
        'email', 'password', 'photo', 'created_on',
        'updated_on', 'last_login', 'login_count'
        ];
    },
    get_user_from_data: (data) => {
      let result;
      if( data ){
        result = {}
        keys = userData.get_keys();
        Object.keys(data).forEach(function(key, index) {
          if(keys.includes(key) && data[key]){
            result[key] = data[key];
          }
        });
      }
      return result;
    },
    get_new_user: (data) => {
      let result = userData.get_user_from_data(data);
      if(result){
        const date = new Date()
        
        result['created_on'] = date.toISOString()
        result['updated_on'] = date.toISOString()
        result['last_login'] = date.toISOString()
        result['login_count'] = 1
      }
      
      return result
    }
}

const AddNewUser = (user_data, done) => {
    try {
      let user = new User(user_data);
      user.save(function(err, data) {
        done(err, data);
      });
    } catch (error) {
      done(error, null);
    }
  };

const getUserById = (user_id, done) => {
  if (user_id){
    User.findById(user_id, (err, data) => done(err, data))
  }
  else{
    done({error: 'Unable to get user, user id is not defined.'}, null)
  }
}

const getUserByName = (username, done) => {
  if (username){
    User.findByOne({username: username}, (err, data) => done(err, data))
  }
  else{
    done({error: 'Unable to get user, username is not defined.'}, null)
  }
}

const userLocals = {
  login: {
    title: "MyApp - Login"
  },
  forgot: {
    title: "Forgot Password"
  },
  register: {
    title: "Register User"
  },
  profile: {
    title: "Profile",
    breadcrumbs: [
      {name: "User", link: '', text: "User"},
      {name: "profile", link: '', text: "Profile"}
    ]
  },
  editPassword: {
    title: "Edit Password",
    breadcrumbs: [
      {name: "User", link: '/profile', text: "User"},
      {name: "editPassword", link: '', text: "Edit Password"}
    ]
  },
  editProfile: {
    title: "Edit Profile",
    breadcrumbs: [
      {name: "User", link: '/profile', text: "User"},
      {name: "editProfile", link: '', text: "Edit Profile"}
    ]
  },
  editAvatar: {
    title: "Edit Avatar",
    breadcrumbs: [
      {name: "User", link: '/profile', text: "User"},
      {name: "editAvatar", link: '', text: "Edit Avatar"}
    ]
  }
}
exports.userLocals = userLocals;


const get_gravatar_hash = (email, s=80) => {
  return (utils.isStr(email)) ? crypto.createHash('md5').update(email.trim().toLowerCase()).digest("hex") : false;
}

const get_gravatar_url = (hash, s=80) => {
  if (utils.isStr(hash)){
    s = parseInt(s)
    s = (s > 10 && s <= 2048 ) ? s : 80;
    return (utils.isStr(hash)) ? "https://www.gravatar.com/avatar/"+hash+".jpg?d=identicon&s="+s : ''
  }
  else return '';
  
}

exports.getUserView = (user) => {
  let result;
  if(user){
    result = {
      _id: user._id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      name: user.firstName + ' ' + user.lastName,
      email: user.email,
      created_on: user.created_on,
      updated_on: user.updated_on,
      last_login: user.last_login,
      login_count: user.login_count,
    };

    if(!utils.isStr(user.photo) || user.photo === ''){
      result.photo = gravatar.getAvatar(user.email);
    }
  }
  return result;
}
/**
 * Ensure user Authenticated Middleware.
 */
exports.ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  else{
    console.log("[ensureAuthenticated] Warning: User is not Authenticated redirect to home.")
    res.redirect('/');
  }
  
}

/**
 * Validate result data.
 */
const validate = (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.locals.errors = errors.errors.reduce((obj, e) => (obj[e.param] = {msg: e.msg}, obj), {});
      res.locals.form = req.body;
      return false;
    }
    else{
      return true;
    }
  } catch (error) {
    return false;
  }
  
  
}

/**
 * Login user Middleware.
 */
 exports.loginUser = (req, res, next) => {
  // Validate incoming input
  if (!validate(req, res, next)) {
    
    res.status(409).render('user/login');
  }
  else{
    //-> 
    next();
  }
}

/**
 * Register user Middleware.
 */
exports.registerUser = (req, res, next) => {
  // Validate incoming input
  if (!validate(req, res, next)) {
    
    res.status(409).render('user/register');
  }
  else{
    //-> 
    console.log('[register] user object: ', userData.get_new_user(req.body));
    AddNewUser(userData.get_new_user(req.body),
      (err, user) => {
        if (err) {
          console.log('[register new user] Error, redirect to home :', err)
          next(err);
        } else {
          // The inserted document is held within
          // the ops property of the doc
          console.log('[register] Ok go to next:', user)
          req.flash('success', `Welcome to home ${user.firstName}.`);
          next(null, user);
        }
    })
  }
}

exports.updatePassword = (req, res, next) => {
  // Validate incoming input
  if (!validate(req, res, next)) {
    
    res.render('user/edit-password', { 
      page: userLocals.editPassword
    });
  }
  else{
    User.findOneAndUpdate(
      {"_id": req.body._id}, 
      {"password": bcrypt.hashSync(req.body.password, 12)}, 
      { new: false }, (err, user) =>   {
      if (err){
        console.log('[updatePassword] Error, redirect to home :', err)
        next(err);
      }
      else{
        req.flash('success', "Your password have been updated with success.");
        console.log('[updatePassword] Ok go to next:', user)
        next(null, user);
      }
    })
  }
}

exports.updateProfile = (req, res, next) => {
  // Validate incoming input
  if (!validate(req, res, next)) {
    
    res.render('user/edit-profile', { 
      page: userLocals.editProfile
    });
  }
  else{
    User.findOneAndUpdate(
      {"_id": req.body._id},
      {
        "username": req.body.username,
        "firstName": req.body.firstName,
        "lastName": req.body.lastName,
        "email": req.body.email,
      },
      { new: false }, (err, user) =>   {
      if (err){
        console.log('[updateProfile] Error, redirect to home :', err)
        next(err);
      }
      else{
        req.flash('success', "Your probile have been updated with success.");
        console.log('[updateProfile] Ok go to next:', user)
        next(null, user);
      }
    })
  }
}



exports.updateAvatar = (req, res, next) => {
  const date = new Date();
  fileController.createFile({
    filename: req.file.filename,
    name: `avatar_${res.locals.user.username}`,
    ext: utils.getExtFromMimeType(req.file.mimetype),
    title: `${res.locals.user.name} Avatar`,
    alt: `${res.locals.user.name} Avatar`,
    size: req.file.size,
    category: 'avatar',
    created_by: res.locals.user._id,
    updated_by: res.locals.user._id,
    created_on: date.toISOString(),
    updated_on: date.toISOString()
    }, (err, file) => {
      if(err){
        req.flash('error', "Unable to register uploaded file data.");
        res.redirect('/profile');
      }
      else{
        User.findOneAndUpdate(
          {"_id": req.body._id},
          {
            "updated_on": date.toISOString(),
            "photo": file._id
          },
          (u_err, u_data) =>{
            if(err){
              req.flash('error', "Unable to update user data.");
            }
            else{
              console.log('[EditAvatar] Avatar updated, redirect to profile:')
              req.flash('success', "Your avatar have been updated with success.");
              res.redirect('/profile');
            }
            
          }
        )
      }
  })
}
/**
 * Dummy middlware for test purpose
 * Only test post request and send json response.
 * Not affect data base.
 */
 exports.formFunctionalTest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    //-> set an object of messages by field id's from errors array
    //-> messages array ordered desc (the last first).
    const errorsForm = errors.errors.reduce((obj, e) => {
      if(!utils.isObject(obj[e.param])) {obj[e.param] = {msgs: []}}
      obj[e.param]['msgs'].unshift(e.msg);
      return obj
    }, {});
    res.status(409).json({status: false, errors: errorsForm, form: req.body} );
  }
  else{
    res.status(200).json({status: true, form: req.body} );
  }
}


