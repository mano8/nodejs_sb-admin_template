'use strict';
const passport = require('passport');
const User = require('../models/User')
const File = require('../models/File')
const mid = require('../controllers/userController.js')
const userSchemas = require('../validation/userSchemas.js')
const {body, checkSchema, validationResult} = require('express-validator');

module.exports = (app) => {

  app.use((req, res, next) => {
    res.locals.user = mid.getUserView(req.user);
    next();
  })
  /**
   * User login routes
   */
  app.route('/login')
    /**
     * Render User login form
     */
    .get(function (req, res) {
        res.render('user/login', { 
          page: mid.userLocals.login
        });
      })
    /**
     * Login user in passeport local
     */
    .post([
      checkSchema(userSchemas.loginSchema),
      mid.loginUser,
      passport.authenticate('local', {
        failureRedirect: '/login',
        failureMessage: 'Wrong login and/or password!'
      })
      ],
      (req, res) => {
        console.log("new user is logged in: ", req.user);
        res.redirect('/profile')
      })
  
  /*app.route('/login/google')
      .get(function (req, res) {
          res.render('user/login', { 
          page: page
          });
      });*/

  app.route('/auth/github')
    .get(passport.authenticate('github'));

  app.route('/auth/github/callback')
    .get(passport.authenticate('github', {failureRedirect: '/'}),
      (req, res) => {
        req.session.user_id = req.user.id
        res.redirect('/profile')
      });
  
  app.route('/forgot-password')
    .get(function (req, res) {
      res.render('user/forgot', { 
        page: mid.userLocals.forgot
      });
    })
    .post(function (req, res) {
      res.json({'error': 'This functionality is not ready.'});
    });
  
  app.route('/logout')
    .get(function(req, res, next) {
      req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
      });
    });
  
  /**
   * User Register route
   */
  app.route('/register')
    /**
     * Render user register form
     */
    .get(function (req, res) {
      res.render('user/register', { 
        page: mid.userLocals.register
      });
    })
    /**
     * Check and sanitize user data.
     * 
     * If no errors register data on data base, 
     * login (local passeport/session) and redirect to profile
     * 
     * Else if errors on form fileds, render the register form with errors
     */
    .post(
      [
        checkSchema(userSchemas.registrationSchema),
        mid.registerUser,
        passport.authenticate('local')
      ],
      (req, res) => {
        console.log('[register] logged in, redirect to profile:')
        res.redirect('/profile');
      });
  
  

  app.route('/profile')
      .get(mid.ensureAuthenticated, function (req, res) {
        res.render('user/profile', { 
          page: mid.userLocals.profile
        });
      });
  
  app.route('/user/edit-avatar')
    .get(mid.ensureAuthenticated, function(req, res) {
      res.render('user/edit-avatar', { 
        page: mid.userLocals.editAvatar
      });
    })
    .post([
      mid.ensureAuthenticated,
      mid.upload.single('avatar'),
      mid.updateAvatar
    ], function(req, res) {
      console.log('[EditAvatar] Password updated, redirect to profile:')
      res.redirect('/profile');
    });
  
  app.route('/user/edit-password')
    .get(mid.ensureAuthenticated, function(req, res) {
      
      res.render('user/edit-password', { 
        page: mid.userLocals.editPassword
      });
    })
    .post(
      [
        mid.ensureAuthenticated,
        checkSchema(userSchemas.editPasswordSchema),
        mid.updatePassword,          
      ],
      (req, res) => {
        console.log('[EditMyPassword] Password updated, redirect to profile:')
        res.redirect('/profile');
      });

  app.route('/user/edit-profile')
    .get(mid.ensureAuthenticated, function(req, res) {
      
      res.render('user/edit-profile', { 
        page: mid.userLocals.editProfile,
        form: res.locals.user
      });
    })
    .post([
      mid.ensureAuthenticated,
      checkSchema(userSchemas.editProfileSchema),
      mid.updateProfile,          
    ], function(req, res) {
      console.log('[EditProfile] Profile updated, redirect to profile:')
      res.redirect('/profile');
    });

  /**
   * User Register route for functional tests
   * Do not affect data base, only test/sanitize form data
   * and return formatted json with results.
   */
  app.route('/json-test/register')
    .post(
      [
        checkSchema(userSchemas.registrationSchema),
        mid.formFunctionalTest
      ], function(req, res) {
        res.json({'error': 'This functionality is not ready.'});
      });

  /**
   * User Edit Password route for functional tests
   * Do not affect data base, only test/sanitize form data
   * and return formatted json with results.
   */
   app.route('/json-test/edit-password')
    .post(
      [
        checkSchema(userSchemas.editPasswordSchema),
        mid.formFunctionalTest
      ], function(req, res) {
        res.json({'error': 'This functionality is not ready.'});
      });

  /**
   * User Edit Password route for functional tests
   * Do not affect data base, only test/sanitize form data
   * and return formatted json with results.
   */
   app.route('/json-test/edit-profile')
    .post(
      [
        checkSchema(userSchemas.editProfileSchema),
        mid.formFunctionalTest
      ], function(req, res) {
        res.json({'error': 'This functionality is not ready.'});
      });
} 