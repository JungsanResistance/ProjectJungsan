const mysql = require('mysql');
const keys = require('../keys/keys');

const connection = mysql.createConnection(keys.AWSdb);

module.exports = {
   /**
    * Checks whether the user has an administrative right to edit the event
    * @param {string} userid - user id of current user.
    * @param {string} groupname - name of the group where event belongs to.
    * @param {string} eventname - name of the specified event.
    * @param {string} date - the date of the occurence of the event.
    * @return {array} res - !length if not an admin, length if is an admin.
    */
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
  /**
  * Checks whether the user is a member of an event
  * @param {string} userid - user id of current user.
  * @param {string} groupname - name of the group where event belongs to.
  * @param {string} eventname - name of the specified event.
  * @param {string} date - the date of the occurence of the event.
  * @return {array} res - !length if not a member, length if is a member.
  */
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
  /**
   * Checks whether the user has an administrative right to edit the group
   * @param {string} userid - user id of current user.
   * @param {string} groupname - name of the group asked for edit permission.
   * @return {array} res - !length if not an admin, length if is an admin.
   */
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
        console.log(res);
        if (err) return reject(err);
        return resolve(res);
      });
    });
  },
  /**
   * Checks whether the user has an administrative right to edit the group
   * @param {string} userid - user id of current user.
   * @param {string} groupname - name of the group asked for edit permission.
   * @return {array} res - !length if not a member, length if is a member.
   */
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
