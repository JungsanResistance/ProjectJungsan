const db = require('../db/index');

module.exports = {
  mainPage: {
    get: (req) => {
      const result = {};
      const currentUser = req.session.passport.user;
      return new Promise((resolve, reject) => (resolve()))
      .then(() => (db.getTotalSum(currentUser)))
      .then((sumlist) => {
        result.sumList = sumlist;
        return db.getGroupList(currentUser);
      })
      .then((groupList) => {
        result.groupList = groupList;
        return result;
      });
    },
  },
  transaction: {
    get: (req) => {
      const currentUser = req.session.passport.user;
      return new Promise((resolve, reject) => (resolve()))
      .then(() => (db.getGroupList(currentUser)))
      .then((groupList) => {
        const body = JSON.stringify(groupList);
        const jsonBody = JSON.parse(body);
        return db.getGroupMember(jsonBody);
      });
    },
    post: body => (db.postTransaction(body)),
  },
  history: {
    get: (req) => {
      const currentUser = req.session.passport.user;
      return new Promise((resolve, reject) => (resolve()))
      .then(() => (db.getHistory(currentUser)));
    },
  },
};
