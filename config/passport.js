const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const configAuth = require('./auth');
const db = require('../db/index');

module.exports = (passport) => {
  passport.serializeUser((userid, done) => {
    done(null, userid);
  });

  passport.deserializeUser((id, done) => {
    db.findAuthUserById(id)
    .then(user => (done(null, user[0])));
  });

  passport.use(new GoogleStrategy({
    clientID: configAuth.googleAuth.clientID,
    clientSecret: configAuth.googleAuth.clientSecret,
    callbackURL: configAuth.googleAuth.callbackURL,
  },
  (accessToken, refreshToken, profile, done) => {
    db.findAuthUserById(profile.id)
    .then((user) => {
      if (user.length) {
        return done(null, user[0].userid);
      } else {
        db.createNewUser(profile.id, profile.displayName, profile.emails[0].value)
        .then(() => done(null, profile.id));
      }
    });
  }));
};
