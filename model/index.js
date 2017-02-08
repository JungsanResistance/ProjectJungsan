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
        console.log(groupList);
        const body = JSON.stringify(groupList);
        const jsonBody = JSON.parse(body);
        return db.getGroupMember(jsonBody);
      });
    },
    post: body => (db.postTransaction(body)),
  },
  group: {
    get: (req) => {
      return new Promise((resolve, reject) => (resolve()))
      .then(() => {
        if (req.query.target === 'email') {
          return db.getUser(req.query.email);
        } else if (req.query.target === 'groupmembers') {
          return db.getGroupMember([{groupname: req.query.groupname}]);
        }
      });
    },
    post: (req) => {
      return new Promise((resolve, reject) => (resolve()))
      .then(() => (db.addNewGroup(req.body)));
    },
  },
  history: {
    get: (req) => {
      const currentUser = req.session.passport.user;
      return new Promise((resolve, reject) => (resolve()))
      .then(() => (db.getHistory(currentUser)));
    },
  },
};
