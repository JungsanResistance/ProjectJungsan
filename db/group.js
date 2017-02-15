const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'projectjungsan.ctkksl4fom4l.ap-northeast-2.rds.amazonaws.com',
  port: 3306,
  user: 'admin',
  password: 'MKkm3hx9',
  database: 'Jungsan_DB',
  multipleStatements: true,
});

module.exports = {
  checkGroupname: (groupname) => {
    const checkGroupnameQuery = `
    SELECT g.groupname
          FROM   groups g
          WHERE groupname = '${groupname}'; `;
    return new Promise((resolve, reject) => {
      connection.query(checkGroupnameQuery, (err, res) => {
        if (err) return reject(err);
        return resolve(res);
      });
    });
  },
  getUser: (email) => {
    const getAllUsersQuery = `
    SELECT username, email
    FROM   user
    WHERE  email = '${email}';
    `;
    return new Promise((resolve, reject) => {
      connection.query(getAllUsersQuery, (err, res) => {
        if (err) return reject(err);
        return resolve(res);
      });
    });
  },
  addNewGroup: (body) => {
    const addNewGroupQuery = `
      INSERT INTO groups (groupname) VALUES ('${body.groupname}');
      INSERT INTO groupadmin (group_idx, admin_idx) VALUES (
        SELECT idx FROM groups where groupname = '${body.groupname}',
        SELECT idx FROM user where userid = '${body.userid}'
      );
    `;
    let addNewMembersQuery = '';
    body.groupmembers.forEach((member) => {
      addNewMembersQuery += `
        INSERT INTO groupmember
                    (user_idx,
                     group_idx,
                     active)
        VALUES      ((SELECT idx
                      FROM   user
                      WHERE  email = '${member.email}'),
                     (SELECT idx
                      FROM   groups
                      WHERE  groupname = '${body.groupname}'),
                      true); `;
    });
    console.log(addNewGroupQuery + addNewMembersQuery);
    return new Promise((resolve, reject) => {
      connection.query(addNewGroupQuery + addNewMembersQuery, (err) => {
        if (err) return reject(err);
        return resolve();
      });
    });
  },
  modifyGroupName: (body) => {
    const modifyGroupNameQuery = `
    UPDATE groups
    SET    groupname = '${body.newgroupname}'
    WHERE  idx = (SELECT *
                  FROM   (SELECT idx
                          FROM   groups
                          WHERE  groupname = '${body.oldgroupname}') AS a); `;
    return new Promise((resolve, reject) => {
      connection.query(modifyGroupNameQuery, (err) => {
        if (err) return reject(err);
        return resolve();
      });
    });
  },
  editActiveMemberStatus: (body) => {
    let editActiveMemberStatusQuery = '';
    // check and insert all unlisted (newly added) members
    body.groupmembers.forEach((groupmember) => {
      editActiveMemberStatusQuery += `
      UPDATE groupmember
      SET    active = ${groupmember.active}
      WHERE  user_idx = (SELECT idx
                         FROM   user
                         WHERE  email = '${groupmember.email}')
             AND group_idx = (SELECT idx
                              FROM   groups
                              WHERE  groupname = '${body.newgroupname}'); `;
    });
    return new Promise((resolve, reject) => {
      connection.query(editActiveMemberStatusQuery, (err) => {
        if (err) return reject(err);
        return resolve();
      });
    });
  },
  editAddGroupMembers: (body) => {
    // check and insert all unlisted (newly added) members
    let editNewGroupMembersQuery = '';
    body.groupmembers.forEach((groupmember) => {
      editNewGroupMembersQuery += `
      INSERT INTO groupmember
                  (user_idx,
                   group_idx,
                   active)
      SELECT (SELECT idx
              FROM   user
              WHERE  email = '${groupmember.email}'),
             (SELECT idx
              FROM   groups
              WHERE  groupname = '${body.newgroupname}'),
             true
      FROM   DUAL
      WHERE  NOT EXISTS (SELECT user_idx
                         FROM   groupmember
                         WHERE  user_idx = (SELECT idx
                                            FROM   user
                                            WHERE  email = '${groupmember.email}')
                                AND group_idx = (SELECT idx
                                                 FROM   groups
                                                 WHERE  groupname = '${body.newgroupname}'));     `;
    });
    return new Promise((resolve, reject) => {
      connection.query(editNewGroupMembersQuery, (err) => {
        if (err) return reject(err);
        return resolve();
      });
    });
  },
  getGroupMember: (grouplist) => {
    let groupClause = `groupname = "${grouplist[0].groupname}"`;
    if (grouplist.length > 1) {
      for (let i = 1; i < grouplist.length; i += 1) {
        groupClause += ` OR groupname = "${grouplist[i].groupname}"`;
      }
    }
    const getGroupMemberQuery = `
    SELECT MemberId.groupname, u.username, u.email, MemberId.active    FROM   user u
          INNER JOIN (SELECT gm.user_idx, GROUPLIST.groupname, gm.active
                  FROM   groupmember gm
                  INNER JOIN
                  (SELECT g.idx, g.groupname
                                         FROM   groups g
                                         WHERE  ${groupClause})AS GROUPLIST
                                         ON GROUPLIST.idx = gm.group_idx
                                        )AS
                 MemberId
          ON u.idx = MemberId.user_idx; `;
    return new Promise((resolve, reject) => {
      connection.query(getGroupMemberQuery, (err, res) => {
        if (err) return reject(err);
        return resolve(res);
      });
    });
  },
  deleteGroup: (groupname) => {
    const deleteGroupQuery = `
    UPDATE groupmember
    SET    active = false
    WHERE  group_idx = (SELECT idx
                        FROM   groups
                        WHERE  groupname = '${groupname}');`;
    return new Promise((resolve, reject) => {
      connection.query(deleteGroupQuery, (err) => {
        if (err) return reject(err);
        return resolve();
      });
    });
  },
};
