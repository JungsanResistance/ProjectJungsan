const mypage = require('../db/mypage');
const admin = require('../db/admin');

module.exports = {
  get: (req) => {
    const result = { groupList: [] };
    const currentUser = req.session.passport.user;
    return new Promise((resolve, reject) => (resolve()))
    .then(() => (mypage.getTotalSum(currentUser)))
    .then((sumlist) => {
      result.sumList = sumlist;
      return mypage.getGroupList(currentUser);
    })
    .then((groupList) => {
      let JSONgroupList = JSON.stringify(groupList);
      JSONgroupList = JSON.parse(JSONgroupList);
      const mapGroupPromise = JSONgroupList.map(group =>
        admin.checkGroupAdmin(currentUser, group.groupname)
        .then((isAdmin) => {
          if (isAdmin.length) group.isadmin = true;
          else group.isadmin = false;
          return group;
        })
      );
      return Promise.all(mapGroupPromise)
      .then((data) => {
        result.groupList = data;
        return result;
      });
    })
    .catch(err => Promise.reject(err));
  },
};
