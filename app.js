const express = require('express');
const session = require('express-session');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');

const index = require('./routes/index');

const app = express();

require('./config/passport')(passport);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'client/dist')));
app.use(session({
  secret: 'projectjungsan',
  resave: true,
  saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());
app.use('/api', index);


// index.html sender for solving mismatch between react-router and express router (make sure to add when adding new urls)
app.get('*', (req, res, next) => {
  if (!req.url.includes('auth') && !req.url.includes('failed')) {
    if (req.session.passport) {
      if (req.url === '/mypage' || req.url === '/history' || req.url.includes('transaction') || req.url.includes('event') || req.url.includes('group')) {
        res.sendfile(path.join(__dirname, 'client/dist/index.html'));
      } else return next();
    } else {
      res.redirect('/');
    }
  } else return next();
});

app.get('/failed', (req, res, next) => {
  if (req.session.passport) {
    res.redirect('/');
  } else {
    res.sendfile(path.join(__dirname, 'client/dist/index.html'));
  }
})
// google authorization
app.get('/auth/google',
  passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/userinfo.profile', 'email'] }));
app.get('/auth/google/callback',
  passport.authenticate('google', {
    successRedirect: '/mypage',
    failureRedirect: '/failed',
  }));

// facebook authorization
app.get('/auth/facebook',
  passport.authenticate('facebook', { scope: ['email'] }));
app.get('/auth/facebook/callback',
  passport.authenticate('facebook', {
    successRedirect: '/mypage',
    failureRedirect: '/failed',
  }));


// logout
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) throw err;
    res.redirect('/');
  });
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
