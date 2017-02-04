const db = require('../db/index');

module.exports = {
  mainPage: {
    get: (req) => {
      const result = {};
      const request = req;
      return new Promise((resolve, reject) => (resolve()))
      .then(() => (db.getTotalSum('cs1')))
      .then((sumlist) => {
        result.sumList = sumlist;
        return db.getGroupList('cs1');
      })
      .then((groupList) => {
        result.groupList = groupList;
        return result;
      });
    },
  },
  transaction: {
    get: (req) => {
      const request = req;
      return new Promise((resolve, reject) => (resolve()))
      .then(() => (db.getGroupList('cs1')))
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
      const request = req;
      return new Promise((resolve, reject) => (resolve()))
      .then(() => (db.getHistory('cs1')));
    },
  },
};
