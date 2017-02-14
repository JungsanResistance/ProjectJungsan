const group = require('../db/group');

module.exports = {
  get: (req) => {
    return new Promise((resolve, reject) => (resolve()))
    .then(() => {
      let results;
      if (req.query.target === 'email') {
        results = group.getUser(req.query.email);
      } else if (req.query.target === 'groupmembers') {
        results = group.getGroupMember([{ groupname: req.query.groupname }]);
      } else if (req.query.target === 'groupname') {
        results = group.checkGroupname(req.query.groupname);
      }
      return results;
    })
    .catch(err => Promise.reject(err));
  },
  post: (req) => {
    return new Promise((resolve, reject) => (resolve()))
    .then(() => (group.addNewGroup(req.body)))
    .catch(err => Promise.reject(err));
  },
// group edit add new person failed
  put: (req) => {
    const data = req.body.data;
    return new Promise((resolve, reject) => (resolve()))
    .then(() => {
      if (req.body.action === 'modifyGroupName') {
        return group.modifyGroupName(data);
      } else if (req.body.action === 'modifyGroupMembers') {
        return (group.editAddGroupMembers(data))
        .then(() => group.editActiveMemberStatus(data));
      } else if (req.body.action === 'modifyGroupAll') {
        return (group.modifyGroupName(data))
        .then(() => (group.editAddGroupMembers(data)))
        .then(() => group.editActiveMemberStatus(data));
      }
    })
    .catch(err => Promise.reject(err));
  },
};
