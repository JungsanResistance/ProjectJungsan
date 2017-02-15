const history = require('../db/history');

module.exports = {
  get: (req) => {
    const currentUser = req.session.passport.user;
    const result = {};
    return new Promise((resolve, reject) => {
      resolve(history.getDebtHistory(currentUser));
    })
    .then((debtEventList) => {
      let JSONdebtEventList = JSON.stringify(debtEventList);
      JSONdebtEventList = JSON.parse(JSONdebtEventList);
      result.debt = JSONdebtEventList;
      return history.getLoanHistory(currentUser);
    })
    .then((loanedEventList) => {
      console.log(loanedEventList);
      let JSONloanedEventList = JSON.stringify(loanedEventList);
      JSONloanedEventList = JSON.parse(JSONloanedEventList);
      result.loaned = JSONloanedEventList;
      return result;
    })
    .catch(err => Promise.reject(err));
  },
  put: (req) => {
    req.body.currentuser = req.session.passport.user;
    if (req.query.type === 'loan') {
      return new Promise((resolve, reject) => (resolve()))
      .then(() => (history.toggleLoanPayment(req.body)))
      .catch(err => Promise.reject(err));
    } else if (req.query.type === 'debt') {
      return new Promise((resolve, reject) => (resolve()))
      .then(() => (history.toggleDebtPayment(req.body)))
      .catch(err => Promise.reject(err));
    }
  },
};
