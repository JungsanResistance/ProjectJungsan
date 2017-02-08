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
  groupedit: {
    get: (req) => {
      return new Promise((resolve, reject) => (resolve()))
      .then(() => {
        let results;
        if (req.query.target === 'email') {
          results = db.getUser(req.query.email);
        } else if (req.query.target === 'groupmembers') {
          results = db.getGroupMember([{ groupname: req.query.groupname }]);
        } else if (req.query.target === 'groupname') {
          results = db.checkGroupname(req.query.groupname);
        }
        return results;
      });
    },
    post: (req) => {
      return new Promise((resolve, reject) => (resolve()))
      .then(() => (db.addNewGroup(req.body)));
    },
    put: (req) => {
      return new Promise((resolve, reject) => (resolve()))
      .then(() => {
        if (req.body.action === 'modifyGroupName') {
          return db.modifyGroupName(req.body.data);
        } else if (req.body.action === 'modifyGroupMembers') {
          return db.getGroupMember([{ groupname: req.body.data.groupname }])
          .then((memberList) => {
            const checker = {};
            const dropped = { groupname: req.body.data.groupname, groupmembers: [] };
            req.body.data.groupmembers.forEach((member) => {
              checker[member.username] = true;
            });
            memberList.forEach((member) => {
              if (checker[member.username] !== true) {
                dropped.groupmembers.push(member.username);
              }
            });
            return dropped;
          })
          .then(dropList => (db.editDropGroupMembers(dropList)));
        } else if (req.body.action === 'modifyGroupAll') {
          return db.modifyGroupName(req.body.data)
          .then(() => (db.getGroupMember([{ groupname: req.body.data.groupname }])))
          .then((memberList) => {
            const checker = {};
            const dropped = { groupname: req.body.data.groupname, groupmembers: [] };
            req.body.data.groupmembers.forEach((member) => {
              checker[member.username] = true;
            });
            memberList.forEach((member) => {
              if (checker[member.username] !== true) {
                dropped.groupmembers.push(member.username);
              }
            });
            return dropped;
          })
          .then(dropList => (db.editDropGroupMembers(dropList)));
        }
      });
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
