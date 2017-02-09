const history = require('../db/history');

module.exports = {
  get: (req) => {
    const currentUser = req.session.passport.user;
    return new Promise((resolve, reject) => (resolve()))
    .then(() => (history.getHistory(currentUser)));
  },
  put: (req) => {
    return new Promise((resolve, reject) => (resolve()))
    .then(() => (history.togglePaid(req.body)));
  },
};
