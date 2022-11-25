'use strict';
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
            res.render('login', { 
              page: page,
              user: user 
            });
        })
        .post(function (req, res) {
          res.json(req.body);
      });
    
    app.route('/login/google')
        .get(function (req, res) {
            res.render('login', { 
            page: page,
            user: user 
            });
        });
    app.route('/login/github')
        .get(function (req, res) {
            res.render('login', { 
            page: page,
            user: user 
            });
        });
    
    app.route('/forgot-password')
        .get(function (req, res) {
            res.render('forgot', { 
              page: page,
              user: user 
            });
        })
        .post(function (req, res) {
          res.json(req.body);
      });

    app.route('/register')
        .get(function (req, res) {
            res.render('register', { 
            page: page,
            user: user 
            });
        });
    
    app.route('/logout')
        .get(function (req, res) {
            res.render('index', { 
            page: page,
            user: user 
            });
        });
} 