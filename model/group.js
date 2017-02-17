const group = require('../db/group');
const auth = require('../db/auth');

module.exports = {
  get: (req) => {
    const currentUser = req.session.passport.user;
    return new Promise((resolve, reject) => (resolve()))
    .then(() =>{
      if (req.query.target === 'groupmembers') {
        return auth.checkGroupMember(currentUser, req.query.groupname);
      }
    })
    .then((membercheck) => {
      console.log('memcheck', membercheck);
      if (!membercheck) return;
      else if (membercheck.length === 0) {
        return Promise.reject('Not a group member');
      }
    })
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
    .catch(err => {
      console.log('catch!');
      return Promise.reject(err)
    });
  },
  post: (req) => {
    req.body.userid = req.session.passport.user;
    return new Promise((resolve, reject) => (resolve()))
    .then(() => (group.addNewGroup(req.body)))
    .catch(err => Promise.reject(err));
  },
// group edit add new person failed
  put: (req) => {
    const body = req.body;
    return auth.checkGroupAdmin(req.session.passport.user, body.oldgroupname)
    .then((isAdmin) => {
      if (!isAdmin.length) return Promise.reject('Not the admin');
    })
    .then(() => {
      if (body.action === 'modifyGroupName') {
        return group.modifyGroupName(body);
      } else if (body.action === 'modifyGroupMembers') {
        return (group.editAddGroupMembers(body))
        .then(() => group.editActiveMemberStatus(body));
      } else if (body.action === 'modifyGroupAll') {
        return (group.modifyGroupName(body))
        .then(() => (group.editAddGroupMembers(body)))
        .then(() => group.editActiveMemberStatus(body));
      }
    })
    .catch(err => Promise.reject(err));
  },
};
