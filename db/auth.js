const mysql = require('mysql');
const keys = require('../keys/keys');

const connection = mysql.createConnection({
  host: 'projectjungsan.ctkksl4fom4l.ap-northeast-2.rds.amazonaws.com',
  port: 3306,
  user: keys.AWSdb.user,
  password: keys.AWSdb.password,
  database: keys.AWSdb.database,
  multipleStatements: true,
});

module.exports = {
  checkEventAdmin: (userid, groupname, eventname, date) => {
    const checkEventAdminQuery = `
    SELECT *
    FROM   eventadmin
    WHERE  event_idx = (SELECT idx
                        FROM   event
                        WHERE  eventname = '${eventname}'
                               AND date = '${date}'
                               AND group_idx = (SELECT idx
                                                FROM   groups
                                                WHERE
                                   groupname = '${groupname}'))
           AND admin_idx = (SELECT idx
                            FROM   user
                            WHERE  userid = '${userid}')
                            `;
    return new Promise((resolve, reject) => {
      connection.query(checkEventAdminQuery, (err, res) => {
        if (err) return reject(err);
        return resolve(res);
      });
    });
  },
  checkEventMember: (userid, groupname, eventname, date) => {
    const checkEventMemberQuery = `
    SELECT *
    FROM   eventmember
    WHERE  event_idx = (SELECT idx
                        FROM   event
                        WHERE  eventname = '${eventname}'
                               AND date = '${date}'
                               AND group_idx = (SELECT idx
                                                FROM   groups
                                   groupname = '${groupname}'))
           AND user_idx = (SELECT idx
                            FROM   user
                            WHERE
                            WHERE  userid = '${userid}')
                            `;
    return new Promise((resolve, reject) => {
      connection.query(checkEventMemberQuery, (err, res) => {
        if (err) return reject(err);
        return resolve(res);
      });
    });
  },
  checkGroupAdmin: (userid, groupname) => {
    const checkGroupAdminQuery = `
    SELECT *
    FROM   groupadmin
    WHERE  group_idx = (SELECT idx
                        FROM   groups
                        WHERE  groupname = '${groupname}')
           AND admin_idx = (SELECT idx
                            FROM   user
                            WHERE  userid = '${userid}')
                            `;
    return new Promise((resolve, reject) => {
      connection.query(checkGroupAdminQuery, (err, res) => {
        if (err) return reject(err);
        return resolve(res);
      });
    });
  },
  checkGroupMember: (userid, groupname) => {
    const checkGroupAdminQuery = `
    SELECT *
    FROM   groupmember
    WHERE  group_idx = (SELECT idx
                        FROM   groups
                        WHERE  groupname = '${groupname}')
           AND user_idx = (SELECT idx
                            FROM   user
                            WHERE  userid = '${userid}')
                            `;
    return new Promise((resolve, reject) => {
      connection.query(checkGroupAdminQuery, (err, res) => {
        if (err) return reject(err);
        return resolve(res);
      });
    });
  },
};
