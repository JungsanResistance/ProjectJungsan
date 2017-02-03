const db = require('../db/index');
module.exports = {
  mainPage: {
    get: (req) => {
      const result = {};
      return new Promise((resolve, reject) => {
        resolve(req)
      })
      .then((req) => {
        return db.getTotalSum('cs1');
      })
      .then(res => {
        result.sumList = res;
        return db.getGroupList('cs1');
      })
      .then(res => {
        result.groupList = res;
        return result;
      });
    },
  },
  transaction: {
    get: (req) => {
      return new Promise((resolve, reject) => {
        resolve(req);
      })
      .then((req) => (db.getGroupMember(['Codestates', '피치트리'])));
    },
  },
  history: {
    get: (req) => {
      return new Promise((resolve, reject) => {
        resolve(req);
      })
      .then((req) => (db.getHistory('cs5')));
    },
  },
}
