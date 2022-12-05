'use strict';
const passport = require('passport');
const User = require('../models/User')
const mid = require('../controllers/userController.js')
const userSchemas = require('../validation/userSchemas.js')
const {body, checkSchema, validationResult} = require('express-validator');

module.exports = (app) => {
  /**
   * User login routes
   */
  app.route('/login')
    /**
     * Render User login form
     */
    .get(function (req, res) {
        let page = {
          name: "Login",
          title: "MyApp - Login"
        }
        res.render('user/login', { 
          page: page
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
      let page = {
        name: "Forgot",
        title: "MyApp - Forgot Password"
      }
      res.render('user/forgot', { 
        page: page
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
      let page = {
        name: "Register",
        title: "MyApp - Register User"
      };
      res.render('user/register', { 
        page: page
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
  
  /**
   * User Register route for functional tests
   * Do not affect data base, only test/sanitize form data
   * and return formatted json with results.
   */
  app.route('/json-test/register')
    .post(
      [
        checkSchema(userSchemas.registrationSchema),
        mid.registerUserTest
      ],
      (req, res) => {
        console.log('[registerTestForm] logged in, redirect to profile:')
        res.json({test: true});
      });

  app.route('/profile')
      .get(mid.ensureAuthenticated, function (req, res) {
        try {
          console.log("[/profile] user connected: ", req.user)
          let page = {
            name: "Profile",
            title: "MyApp - Profile",
            breadcrumbs: [
              {name: "User", link: '', text: "User"},
              {name: "Profile", link: '', text: "Profile"}
            ]
          };
          res.render('user/profile', { 
            page: page
          });
        } catch (error) {
          console.log("error user undefined: ", error)
          res.redirect('/login');
        }
        
          
      });
  
  app.route('/user/edit-avatar')
    .get(mid.ensureAuthenticated, function(req, res) {
      res.json({'error': 'This functionality is not ready.'});
    })
    .post(mid.ensureAuthenticated, function(req, res) {
      res.json({'error': 'This functionality is not ready.'});
    });
  
  app.route('/user/edit-password')
    .get(mid.ensureAuthenticated, function(req, res) {
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
    })
    .post(
      [
        mid.ensureAuthenticated,
        checkSchema(userSchemas.editPasswordSchema),
        mid.updatePassword,          
      ],
      (req, res) => {
        console.log('[EditMyPassword] logged in, redirect to profile:')
        res.redirect('/profile');
      });
  
  app.route('/user/edit-profile')
    .get(mid.ensureAuthenticated, function(req, res) {
      let page = {
        name: "EditMyProfile",
        title: "MyApp - Edit My Profile",
        breadcrumbs: [
          {name: "User", link: '/profile', text: "User"},
          {name: "EditMyProfile", link: '', text: "Edit My Profile"}
        ]
      };
      
      res.render('user/edit-profile', { 
        page: page,
        form: res.locals.user
      });
    })
    .post(mid.ensureAuthenticated, function(req, res) {
      res.json({'error': 'This functionality is not ready.'});
    });
} 