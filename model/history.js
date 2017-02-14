const history = require('../db/history');

module.exports = {
  get: (req) => {
    const currentUser = req.session.passport.user;
    return new Promise((resolve, reject) => (resolve()))
    .then(() => (history.getHistory(currentUser)));
  },
  put: (req) => {
    req.body.currentuser = req.session.passport.user;
    if (req.query.type === 'loan') {
      return new Promise((resolve, reject) => (resolve()))
      .then(() => (history.toggleLoanPayment(req.body)));
    }
    else if (req.query.type === 'debt') {
      return new Promise((resolve, reject) => (resolve()))
      .then(() => (history.toggleDebtPayment(req.body)));
    };
  },
};
