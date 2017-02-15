const history = require('../db/history')
const auth = require('../db/auth');

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
      const mapDebtEventwithAdmin = JSONdebtEventList.map(event =>
        auth.checkEventAdmin(currentUser, event.groupname, event.eventname, event.date)
        .then((isAdmin) => {
          if (isAdmin.length) event.isadmin = true;
          else event.isadmin = false;
          return event;
        })
      );
      Promise.all(mapDebtEventwithAdmin)
      .then((data) => {
        result.debt = data;
      });
      return history.getLoanHistory(currentUser);
    })
    .then((loanedEventList) => {
      let JSONloanedEventList = JSON.stringify(loanedEventList);
      JSONloanedEventList = JSON.parse(JSONloanedEventList);
      const mapLoanedEventwithAdmin = JSONloanedEventList.map(event =>
        auth.checkEventAdmin(currentUser, event.groupname, event.eventname, event.date)
        .then((isAdmin) => {
          if (isAdmin.length) event.isadmin = true;
          else event.isadmin = false;
          return event;
        })
      );
      return Promise.all(mapLoanedEventwithAdmin)
      .then((data) => {
        result.loaned = data;
        return result;
      });
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
