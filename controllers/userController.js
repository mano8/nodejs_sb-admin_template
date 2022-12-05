//js
var crypto = require("crypto");
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
var axios = require("axios");
const User = require('../models/User');
const Utils = require('../utils/utils.js');
const {body, checkSchema, validationResult} = require('express-validator');
let utils = new Utils();


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

/**
 * Ensure user Authenticated Middleware.
 */
exports.ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}

/**
 * Login user Middleware.
 */
 exports.loginUser = (req, res, next) => {
  // Validate incoming input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.locals.errors = errors.errors.reduce((obj, e) => (obj[e.param] = {msg: e.msg}, obj), {});
    res.locals.form = req.body
    res.status(409).render('user/login');
  }
  else{
    //-> 
    next(null, true);
  }
}

/**
 * Register user Middleware.
 */
exports.registerUser = (req, res, next) => {
  // Validate incoming input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.locals.errors = errors.errors.reduce((obj, e) => (obj[e.param] = {msg: e.msg}, obj), {});
    res.locals.form = req.body
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
          next(null, user);
        }
    })
  }
}

/**
 * Dummy register user middlware for test purpose
 * Only test post request and send json response.
 * Not affect data base.
 */
exports.registerUserTest = (req, res, next) => {
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

exports.updatePassword = (req, res, next) => {
  // Validate incoming input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.locals.errors = errors.errors.reduce((obj, e) => (obj[e.param] = {msg: e.msg}, obj), {});
    res.locals.form = req.body
    let page = {
      name: "EditMyPassword",
      title: "MyApp - Edit My Password",
      breadcrumbs: [
        {name: "User", link: '/profile', text: "User"},
        {name: "EditMyPassword", link: '', text: "Edit My Password"}
      ]
    };
    res.render('user/edit-password', { 
      page: page
    });
  }
  else{
    User.findOneAndUpdate({"_id": req.body._id}, {"password": bcrypt.hashSync(req.body.newPassword, 12)}, { new: false }, (err, user) =>   {
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


