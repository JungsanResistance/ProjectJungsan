const misc = require('../db/misc');


module.exports = {
  // get profile of self
  get: (req) => {
    const currentUser = req.session.passport.user;
    return new Promise((resolve, reject) => (resolve()))
    .then(() => (misc.getSelf(currentUser)))
    .catch(err => Promise.reject(err));
  },
  // check the pending status between two users, and if none, create new pending status
  // if exists, accept and resolve all transactions between them or reject pending request depending on the users' selection
  put: (req) => {
    const currentUser = req.session.passport.user;
    const action = req.body.action;
    return new Promise((resolve, reject) => {
      resolve(misc.checkStatus(req.body, currentUser));
    })
    .then((pendingDetail) => {
      console.log(pendingDetail);
      let JSONpendingDetail = JSON.stringify(pendingDetail);
      JSONpendingDetail = JSON.parse(JSONpendingDetail);
      console.log('pending',JSONpendingDetail);
      let toBeProcessed;
      if (JSONpendingDetail.length) {
        if (JSONpendingDetail[0].status === 1 && action === 'accept') {
          toBeProcessed = misc.resolveAllPayments(req.body, currentUser);
        } else if (JSONpendingDetail[0].status === 1 && action === 'reject') {
          toBeProcessed = misc.rejectPending(JSONpendingDetail[0], currentUser);
        } else if (JSONpendingDetail[0].status === 3 && action === 'pending') {
          toBeProcessed = misc.updatePending(JSONpendingDetail[0], currentUser);
        } else {
          toBeProcessed = Promise.reject('Bad request');
        }
      } else {
        if (action === 'pending') {
          toBeProcessed = misc.insertPending(req.body, currentUser);
        } else {
          toBeProcessed = Promise.reject('Bad request');
        }
      }
      return toBeProcessed;
    })
    // after successful change, get email address of current user to send notification emails
    .then(res => misc.getSelf(currentUser))
    .then((selfDetail) => {
      let JSONselfDetail = JSON.stringify(selfDetail);
      JSONselfDetail = JSON.parse(JSONselfDetail);
      return JSONselfDetail;
    });
  },
};
