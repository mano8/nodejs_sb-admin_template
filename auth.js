const passport = require('passport');
const LocalStrategy = require('passport-local');
const GitHubStrategy = require('passport-github');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const User = require('./models/User')

module.exports = function () {

  passport.use('local', new LocalStrategy(function verify(username, password, done){
    console.log("[LocalStrategy] login...")
    User.findOne({ username: username }, (err, user) => {
      console.log(`User ${username} attempted to log in.`);
      console.log(`User ${username} -> ${password}.`);
      if (err) return done(err);
      if (!user) return done(null, false);
      if (!bcrypt.compareSync(password, user.password)) return done(null, false);
      return done(null, user);
    });
  }));

  passport.use(new GitHubStrategy({
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "https://boilerplate-advancednode.mano8.repl.co/auth/github/callback"
    },
    function(accessToken, refreshToken, profile, cb) {
      console.log(profile);
      //Database logic here with callback containing your user object
      User.findOneAndUpdate(
        { id: profile.id },
        {
          $setOnInsert: {
            id: profile.id,
            username: profile.username,
            name: profile.displayName || 'John Doe',
            photo: profile.photos[0].value || '',
            email: Array.isArray(profile.emails)
              ? profile.emails[0].value
              : 'No public email',
            created_on: new Date(),
            provider: profile.provider || ''
          },
          $set: {
            last_login: new Date()
          },
          $inc: {
            login_count: 1
          }
        },
        { upsert: true, new: true },
        (err, doc) => {
          return cb(null, doc.value);
        }
      );
    }
  ));
  
  passport.serializeUser((user, done) => {
    console.log("serializeUser: ", user)
    done(null, user._id);
  });
  
  passport.deserializeUser((id, done) => {
    console.log("deserializeUser, id: ", mongoose.Types.ObjectId(id)) // mongoose.Types.ObjectId(id)
    User.findOne({ _id: mongoose.Types.ObjectId(id) }, (err, doc) => {
      done(null, doc);
    });
  });
}