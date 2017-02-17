const misc = require('../db/misc');

module.exports = {
  get: (req) => {
    const currentUser = req.session.passport.user;
    return new Promise((resolve, reject) => (resolve()))
    .then(() => (misc.getSelf(currentUser)))
    .catch(err => Promise.reject(err));
  },
  put: (req) => {
    const currentUser = req.session.passport.user;
    return new Promise((resolve, reject) => {
      resolve(misc.checkPending(req.body, currentUser));
    })
    .then((pendingDetail) => {
      let JSONpendingDetail = JSON.stringify(pendingDetail);
      JSONpendingDetail = JSON.parse(JSONpendingDetail);
      if (JSONpendingDetail[0].status === 1) {
        misc.resolveAllPayments(req.body, currentUser);
      // } else {
      //
      }
    })
    .then(res => console.log('res?', res))
    .catch(err => Promise.reject(err));
  },
};
