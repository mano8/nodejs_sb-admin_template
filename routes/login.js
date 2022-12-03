'use strict';
const passport = require('passport');
const User = require('../models/User')
const mid = require('../controllers/user.js')
const {body, checkSchema, validationResult} = require('express-validator');

let page = {
  name: "Login",
  title: "MyApp - Login",
  /*showSocialAuth: {
    google: false,
    github: false
  }*/
};

module.exports = (app) => {
    app.route('/login')
        .get(function (req, res) {
            let page = {
              name: "Login",
              title: "MyApp - Login"
            }
            res.render('user/login', { 
              page: page
            });
        })
        .post(passport.authenticate('local', {
          failureRedirect: '/login',
          failureMessage: 'Wrong login and/or password!'
        }),
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
              page: page
            });
        })
        .post(function (req, res) {
          res.json({'error': 'This functionality is not ready.'});
      });

    app.route('/register')
        .get(function (req, res) {
          
          res.render('user/register', { 
            page: page
            });
        })
        .post(
          [
            checkSchema(mid.registrationSchema),
            mid.registerUser,
            passport.authenticate('local', { failureRedirect: '/register' })
          ],
          (req, res) => {
            console.log('[register] logged in, redirect to profile:')
            res.redirect('/profile');
          });
    
    app.route('/logout')
        .get(function(req, res, next) {
          req.logout(function(err) {
            if (err) { return next(err); }
            res.redirect('/');
          });
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
      .get(function(req, res) {
        res.json({'error': 'This functionality is not ready.'});
      })
      .post(function(req, res) {
        res.json({'error': 'This functionality is not ready.'});
      });
    
    app.route('/user/edit-password')
      .get(function(req, res) {
        res.json({'error': 'This functionality is not ready.'});
      })
      .post(function(req, res) {
        res.json({'error': 'This functionality is not ready.'});
      });
    
    app.route('/user/edit-profile')
      .get(function(req, res) {
        res.json({'error': 'This functionality is not ready.'});
      })
      .post(function(req, res) {
        res.json({'error': 'This functionality is not ready.'});
      });
} 