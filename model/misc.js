const misc = require('../db/misc');

module.exports = {
  get: (req) => {
    const currentUser = req.session.passport.user;
    return new Promise((resolve, reject) => (resolve()))
    .then(() => (misc.getSelf(currentUser)));
  },
  put: (req) => {
    const currentUser = req.session.passport.user;
    return new Promise((resolve, reject) => (resolve()))
    .then(() => (misc.markAllToBePaid(req.body, currentUser)))
    .then(() => (misc.markAllToBeReceived(req.body, currentUser)));
  },
};
