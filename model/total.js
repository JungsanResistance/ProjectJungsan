const total = require('../db/total');

module.exports = {
  put: (req) => {
    return new Promise((resolve, reject) => (resolve()))
    .then(() => (total.markAllToBePaid(req.body)))
    .then(() => (total.markAllToBeReceived(req.body)));
  },
};
