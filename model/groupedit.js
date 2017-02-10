const groupEdit = require('../db/groupedit');

module.exports = {
  get: (req) => {
    return new Promise((resolve, reject) => (resolve()))
    .then(() => {
      let results;
      if (req.query.target === 'email') {
        results = groupEdit.getUser(req.query.email);
      } else if (req.query.target === 'groupmembers') {
        results = groupEdit.getGroupMember([{ groupname: req.query.groupname }]);
      } else if (req.query.target === 'groupname') {
        results = groupEdit.checkGroupname(req.query.groupname);
      }
      return results;
    });
  },
  post: (req) => {
    return new Promise((resolve, reject) => (resolve()))
    .then(() => (groupEdit.addNewGroup(req.body)));
  },
// group edit add new person failed
  put: (req) => {
    const data = req.body.data;
    return new Promise((resolve, reject) => (resolve()))
    .then(() => {
      if (req.body.action === 'modifyGroupName') {
        return groupEdit.modifyGroupName(data);
      } else if (req.body.action === 'modifyGroupMembers') {
        return (groupEdit.editNewGroupMembers(data))
      } else if (req.body.action === 'modifyGroupAll') {
        return (groupEdit.modifyGroupName(data))
        .then(() => (groupEdit.editAddGroupMembers(data)))
        .then(() => groupEdit.editActiveMemberStatus(data));
      }
    });
  },
};
