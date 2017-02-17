const history = require('../db/history');
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
      if (JSONdebtEventList.length) {
        const mapDebtEventwithAdmin = JSONdebtEventList.map(event =>
          auth.checkEventAdmin(currentUser, event.groupname, event.eventname, event.date)
          .then((isAdmin) => {
            if (isAdmin.length) event.isadmin = true;
            else event.isadmin = false;
            return event;
          })
        );
        return Promise.all(mapDebtEventwithAdmin);
      }
      return Promise.resolve()
    })
    .then((data) => {
      (!data) ? result.debt = [] : result.debt = data;
      return history.getLoanHistory(currentUser);
    })
    .then((loanedEventList) => {
      let JSONloanedEventList = JSON.stringify(loanedEventList);
      JSONloanedEventList = JSON.parse(JSONloanedEventList);
      if (JSONloanedEventList.length) {
        const mapLoanedEventwithAdmin = JSONloanedEventList.map(event =>
          auth.checkEventAdmin(currentUser, event.groupname, event.eventname, event.date)
          .then((isAdmin) => {
            if (isAdmin.length) event.isadmin = true;
            else event.isadmin = false;
            return event;
          })
        );
        return Promise.all(mapLoanedEventwithAdmin);
      }
      return Promise.resolve()
    })
    .then((data) => {
      !data ? result.loaned = [] : result.loaned = data;
      return result;
    })
    .catch(err => Promise.reject(err));
  },
  put: (req) => {
    req.body.currentUser = req.session.passport.user;
    if (req.query.type === 'loan') {
      return history.checkPendingLoan(req.body)
      .then((status) => {
        let JSONstatus = JSON.stringify(status);
        JSONstatus = JSON.parse(JSONstatus);
        if (!JSONstatus.length || JSONstatus[0].status === 3) {
          return history.toggleLoanPayment(req.body);
        } else {
          if (req.body.action === 'accept') {
            history.acceptPendingLoanEvent(req.body);
            return history.toggleLoanPayment(req.body);
          } else if (req.body.action === 'reject'){
            return history.rejectPendingLoanEvent(req.body);
          } else {
            return Promise.reject('Bad request');
          }
        }
      })
      .catch(err => Promise.reject(err));
    } else if (req.query.type === 'debt') {
      return history.checkPendingDebt(req.body)
      .then((status) => {
        let JSONstatus = JSON.stringify(status);
        JSONstatus = JSON.parse(JSONstatus);
        if (!JSONstatus.length || JSONstatus[0].status === 3) {
          return history.insertPendingDebtEvent(req.body);
        } else {
          return Promise.reject('Already sent pending');
        }
      })
      .catch(err => Promise.reject(err));
    }
  },
};
