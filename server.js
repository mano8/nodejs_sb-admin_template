'use strict';

const express     = require('express');
const bodyParser  = require('body-parser');
const cors        = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');

require('dotenv').config();
var MongoStore = require('connect-mongo');

const publicRoutes = require('./routes/public.js');
const userRoutes = require('./routes/user.js');
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


// Creating custom middleware with Express
app.use((req, res, next) => {
  res.locals.doctype = 'html'
  res.locals.isAuthenticated = req.isAuthenticated();
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

//User routes
userRoutes(app);  

//Public routes
publicRoutes(app);  



//Routing for API 
auth();

    
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
