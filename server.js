'use strict';

const express     = require('express');
const bodyParser  = require('body-parser');
const cors        = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');
const LocalStrategy = require('passport-local');
const path = require('path');
const bcrypt = require('bcrypt');
const crypto = require("crypto");
require('dotenv').config();
var MongoStore = require('connect-mongo');
const User = require('./models/User')
const apiRoutes = require('./routes/user.js');
const auth = require('./auth.js');
const Utils = require('./utils/utils.js');
let utils = new Utils();

let app = express();

const URI = process.env.MONGO_URI;
const port = process.env.PORT || 3000
const host = process.env.HOST || '127.0.0.1'

//mongo connection
var dbConn = require('./connection.js');


app.set('view engine', 'pug');
app.set('views', './views/pug');
app.use('/public', express.static(process.cwd() + '/public'));

app.use(cors({origin: '*'})); //For FCC testing purposes only



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  name: 'M8SESS_ID',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false,
    httpOnly: true
  },
  key: 'express.sid',
  store: MongoStore.create({
    client: mongoose.connection.getClient()
  })
}));
app.use(passport.initialize());
app.use(passport.session());


app.use(flash());

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

const getUserView = (user) => {
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

    if(!utils.isStr(user.photo)){
      const hash = get_gravatar_hash(user.email)
      result.photo = get_gravatar_url(hash)
      result.photo_20 = get_gravatar_url(hash, 20)
      result.photo_400 = get_gravatar_url(hash, 400)
    }
  }
  return result;
}
// Creating custom middleware with Express
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.isAuthenticated();
  res.locals.user = getUserView(req.user);
  if(req.session && req.session.messages){
    req.flash('error', req.session.messages);
    delete req.session.messages
  }
  
  res.locals.messages = {
    error: req.flash('error') || null,
    info: req.flash('info') || null,
    success: req.flash('success') || null
  }
  res.locals.showSocialAuth = {
    isActive: (process.env.AUTH_GOOGLE === 'true' || process.env.AUTH_GITHUB === 'true') ? true: false,
    google: process.env.AUTH_GOOGLE,
    github: process.env.AUTH_GITHUB
  }
  next();
});

//Routing for API 
apiRoutes(app);  

auth();

//Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    let page = {
      name: "Dashboard",
      title: "Dashboard",
      breadcrumbs: [
        {
          name: "Dashboard",
          link: '',
          text: "Dashboard",
        }
      ]
    }
    console.log("Home page data: ", page)
    res.render('index', { 
      page: page
    });
  });



    
//404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

//Start our server!
const listener = app.listen(port, host, function () {
  console.log('Your app is listening on port ' + listener.address().port + " addr: "+listener.address().address);
  
});

module.exports = app; //for testing
