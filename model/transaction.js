const transaction = require('../db/transaction');

module.exports = {
  get: (req) => {
    const currentUser = req.session.passport.user;
    return new Promise((resolve, reject) => (resolve()))
    .then(() => (transaction.getGroupList(currentUser)))
    .then((groupList) => {
      console.log(groupList);
      const body = JSON.stringify(groupList);
      const jsonBody = JSON.parse(body);
      return transaction.getGroupMember(jsonBody);
    });
  },
  post: body => (transaction.postTransaction(body)),
};
