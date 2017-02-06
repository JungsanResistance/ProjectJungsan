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
      }
      else {
        db.createNewUser(profile.id, profile.displayName, profile.emails[0].value)
        .then(() => {
          return done(null, profile.id)
        });
      }
    });
  }));
};



/*
app.get('/auth/google/callback', function (req, res, next) {
    passport.authenticate('google', function (err, user, info) {
        request.get("https://www.google.com/m8/feeds/contacts/default/full?v=3.0&access_token=" + user.accessToken, function (error, result) {
            var xml = result.body;
            var parseString = require('xml2js').parseString;
            parseString(xml, function (err, result) {
                var entries = result.feed.entry, contacts = [];
                _.each(entries, function (entry) {
                    if (!(entry['gd:name']===undefined)) {
                        var gdName = entry['gd:name'][0]['gd:fullName'][0];
                        var gdEmail = entry['gd:email'][0]['$']['address'];
                        contacts.push({name: gdName, email: gdEmail});
                    }

                });
                res.send(contacts);
            });

        });
    })(req, res, next)
});
*/
