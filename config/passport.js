const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const keys = require('../keys/keys');
const signin = require('../db/signin');
const email = require('../model/email');

module.exports = (passport) => {
  passport.serializeUser((userid, done) => {
    done(null, userid);
  });

  passport.deserializeUser((id, done) => {
    signin.findAuthUserById(id)
    .then(user => (done(null, user[0])));
  });

  passport.use(new GoogleStrategy({
    clientID: keys.googleAuth.clientID,
    clientSecret: keys.googleAuth.clientSecret,
    callbackURL: keys.googleAuth.callbackURL,
  },
  (accessToken, refreshToken, profile, done) => {
    signin.findAuthUserById(profile.id)
    .then((user) => {
      if (user.length) {
        return done(null, user[0].userid);
      } else {
        signin.createNewUser(profile.id, profile.displayName, profile.emails[0].value)
        .then(() => done(null, profile.id));
      }
    });
  }));
  passport.use(new FacebookStrategy({
    clientID: keys.facebookAuth.clientID,
    clientSecret: keys.facebookAuth.clientSecret,
    callbackURL: keys.facebookAuth.callbackURL,
    profileFields: ['id', 'displayName', 'emails'],
  },
  (accessToken, refreshToken, profile, done) => {
    console.log('profile', profile)
    signin.findAuthUserById(profile.id)
    .then((user) => {
      if (user.length) {
        return done(null, user[0].userid);
      } else {
        return signin.checkDuplicateEmail(profile.emails[0].value)
        .then((isDuplicate) => {
          let JSONDuplicate = JSON.stringify(isDuplicate);
          JSONDuplicate = JSON.parse(JSONDuplicate);
          console.log(JSONDuplicate);
          if (!JSONDuplicate.length) {
            return signin.createNewUser(profile.id, profile.displayName, profile.emails[0].value);
          } else {
            email.duplicate(JSONDuplicate[0]);
            return Promise.reject('An id already exists');
          }
        })
        .then(() => done(null, profile.id))
        .catch(err => done(null, false, { message: err }));
      }
    });
  }));

};
