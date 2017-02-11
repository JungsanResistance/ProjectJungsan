const misc = require('../db/misc');

module.exports = {
  get: (req) => {
    const currentUser = req.session.passport.user;
    return new Promise((resolve, reject) => (resolve()))
    .then(() => (misc.getSelf(currentUser)));
  },
  put: (req) => {
    const currentUser = req.session.passport.user;
    return new Promise((resolve, reject) => {
      resolve(misc.resolveAllPayments(req.body, currentUser))
    })
    .then((res) => console.log('res?', res))
    .catch((err) => Promise.reject(err));
  },
};
