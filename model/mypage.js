const mypage = require('../db/mypage');

module.exports = {
  get: (req) => {
    const result = {};
    const currentUser = req.session.passport.user;
    return new Promise((resolve, reject) => (resolve()))
    .then(() => (mypage.getTotalSum(currentUser)))
    .then((sumlist) => {
      result.sumList = sumlist;
      return mypage.getGroupList(currentUser);
    })
    .then((groupList) => {
      result.groupList = groupList;
      return result;
    })
    .catch(err => Promise.reject(err));
  },
};
