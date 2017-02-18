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
    const type = req.body.type;
    return new Promise((resolve, reject) => {
      resolve(misc.checkStatus(req.body, currentUser));
    })
    .then((pendingDetail) => {
      let JSONpendingDetail = JSON.stringify(pendingDetail);
      JSONpendingDetail = JSON.parse(JSONpendingDetail);
      console.log('pending',JSONpendingDetail);
      let toBeProcessed;
      if (JSONpendingDetail.length) {
        if (JSONpendingDetail[0].status === 1 && type === 'accept') {
          toBeProcessed = misc.resolveAllPayments(req.body, currentUser);
        } else if (JSONpendingDetail[0].status === 1 && type === 'reject') {
          toBeProcessed = misc.rejectPending(req.body, currentUser);
        } else if (JSONpendingDetail[0].status === 0 && type === 'pending') {
          toBeProcessed = misc.updatePending(req.body, currentUser);
        } else {
          toBeProcessed = Promise.reject('Bad request');
        }
      } else {
        if (type === 'pending') {
          toBeProcessed = misc.insertPending(req.body, currentUser);
        } else {
          toBeProcessed = Promise.reject('Bad request');
        }
      }
      return toBeProcessed;
    })
  },
};
