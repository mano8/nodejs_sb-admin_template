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
let user;
module.exports = (app) => {
    app.route('/login')
        .get(function (req, res) {
            console.log("login message: ", req.session.messages);
            req.flash('error', req.session.messages);
            delete req.session.messages
            let page = {
              name: "Login",
              title: "MyApp - Login",
              messages: {
                error: req.flash('error') || null,
                info: req.flash('info') || null,
                success: req.flash('success') || null
              }
        
            }
            res.render('login', { 
              page: page,
              user: user 
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
            res.render('login', { 
            page: page,
            user: user 
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
            res.render('forgot', { 
              page: page,
              user: user 
            });
        })
        .post(function (req, res) {
          res.json({'error': 'This functionality is not ready.'});
      });

    app.route('/register')
        .get(function (req, res) {
          
          res.render('register', { 
            page: page,
            user: user
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
            res.render('profile', { 
              page: page,
              user: req.user 
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