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
require('dotenv').config();
var MongoStore = require('connect-mongo');
const User = require('./models/User')
const apiRoutes = require('./routes/login.js');
const auth = require('./auth.js');

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
  resave: true,
  saveUninitialized: true,
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

/*passport.use('local', new LocalStrategy(function verify(username, password, done){
  console.log("[LocalStrategy] login...")
  User.findOne({ email: username }, (err, user) => {
    console.log(`User ${username} attempted to log in.`);
    console.log(`User ${password} -> ${password}.`);
    if (err) return done(err);
    if (!user) return done(null, false);
    if (!bcrypt.compareSync(password, user.password)) return done(null, false);
    return done(null, user);
  });
}));
passport.serializeUser((user, done) => {
  console.log("serializeUser: ", user)
  done(null, user._id);
});

passport.deserializeUser((id, done) => {
  console.log("deserializeUser, id: ", id) // mongoose.Types.ObjectId(id)
  User.findOne({ _id: id }, (err, doc) => {
    done(null, doc);
  });
});*/

app.use(flash());

/*app.use(() => (req, res, next) => {

  let pageData = {
    name: null,
    title: null,
    breadcrumbs: null,
    messages: {
      error: req.flash('error') || null,
      info: req.flash('info') || null,
      success: req.flash('success') || null
    }
    
  }
  req.pageData = pageData;
  next();
});*/

//Routing for API 
apiRoutes(app);  

auth();

//Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    let user;
    let page = {
      name: "Dashboard",
      title: "Dashboard",
      breadcrumbs: [
        {
          name: "Dashboard",
          link: '',
          text: "Dashboard",
        }
      ],
      messages: {
        error: req.flash('error') || null,
        info: req.flash('info') || null,
        success: req.flash('success') || null
      }

    }
    console.log("Home page data: ", page)
    console.log("Home page data, user: ", req.user)
    res.render('index', { 
      page: page,
      user: req.user 
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
