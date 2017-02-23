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
  /**
   * Checks whether the user is registered in DB
   * when registered, pass with the corresponding id
   * If not, check whether the registered email exist
   * If exists, return error
   * If not, register user and pass with the corresponding id
   * @param {string} accessToken - provided by google.
   * @param {string} refreshToken - provided by google.
   * @param {object} profile - includes displayName, email, and OAuth id provided by google.
   * @param {function} done - working as next().
   */
  (accessToken, refreshToken, profile, done) => {
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
  passport.use(new FacebookStrategy({
    clientID: keys.facebookAuth.clientID,
    clientSecret: keys.facebookAuth.clientSecret,
    callbackURL: keys.facebookAuth.callbackURL,
    profileFields: ['id', 'displayName', 'emails'],
  },
  /**
   * Checks whether the user is registered in DB
   * when registered, pass with the corresponding id
   * If not, check whether the registered email exist
   * If exists, return error
   * If not, register user and pass with the corresponding id
   * @param {string} accessToken - provided by facebook.
   * @param {string} refreshToken - provided by facebook.
   * @param {object} profile - includes displayName, email, and OAuth id provided by facebook.
   * @param {function} done - working as next().
   */
  (accessToken, refreshToken, profile, done) => {
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
