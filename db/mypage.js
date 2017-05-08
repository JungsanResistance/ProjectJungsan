const mysql = require('mysql');
const keys = require('../keys/keys');

const connection = mysql.createConnection(keys.AWSdb);

module.exports = {
  /**
   * get net amount of outstanding balance between the current user and all others that have debt or loan towards the user
   * @param {string} userid - the id of the current user.
   * @return {array} res - the list of object containing the subject's name, email, and the net outstanding amount
   */
  getTotalSum: (userid) => {
    const getTotalSumQuery = `
    SELECT username,
           email,
           sum(cost) AS cost
    FROM (
           (SELECT sum(em.cost) AS cost,
                   e.recipient_idx AS user_idx
            FROM eventmember em,
                 event e
            WHERE em.event_idx = e.idx
              AND em.user_idx =
                (SELECT idx
                 FROM user
                 WHERE userid = "${userid}")
              AND em.ispaid=FALSE
            GROUP BY e.recipient_idx)
         UNION ALL
           (SELECT -sum(em.cost) AS cost,
                    em.user_idx AS user_idx
            FROM eventmember em,
                 event e
            WHERE em.event_idx = e.idx
              AND e.recipient_idx =
                (SELECT idx
                 FROM user
                 WHERE userid = "${userid}")
              AND em.ispaid=FALSE
            GROUP BY em.user_idx)) AS Z
            LEFT JOIN user u ON u.idx=Z.user_idx
    GROUP BY Z.user_idx
    HAVING sum(cost) <> 0;
`;

    return new Promise((resolve, reject) => {
      connection.query(getTotalSumQuery, (err, res) => {
        if (err) return reject(err);
        return resolve(res);
      });
    });
  },

  /**
   * get the list of groups in which the user is taking part of
   * @param {string} userid - the id of the current user.
   * @return {array} res - the list of object containing the groups in which the user is taking part of.
   */
  getGroupList: (userid) => {
    console.log(userid);
    const getGroupListQuery = `
    SELECT g.groupname
          FROM   groups g
          INNER JOIN  (SELECT gm.group_idx
                  FROM   groupmember gm
                  WHERE  (SELECT idx
                          FROM   user
                          WHERE  userid = "${userid}") = gm.user_idx and gm.active = true)AS JOINEDGROUP
                          ON JOINEDGROUP.group_idx = g.idx; `;
    return new Promise((resolve, reject) => {
      connection.query(getGroupListQuery, (err, res) => {
        if (err) return reject(err);
        return resolve(res);
      });
    });
  },
};
