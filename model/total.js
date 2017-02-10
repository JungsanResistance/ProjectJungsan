const total = require('../db/total');

module.exports = {
  put: (req) => {
    const currentUser = req.session.passport.user;
    return new Promise((resolve, reject) => (resolve()))
    .then(() => (total.markAllToBePaid(req.body, currentUser)))
    .then(() => (total.markAllToBeReceived(req.body, currentUser)));
  },
};
