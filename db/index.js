const mysql = require('mysql');
const connection = mysql.createConnection({
  host     : 'projectjungsan.ctkksl4fom4l.ap-northeast-2.rds.amazonaws.com',
  port     : 3306,
  user     : 'admin',
  password : 'MKkm3hx9',
  database : 'Jungsan_DB'
});

module.exports = {
  getTotalSum: (userid) => {
    //userId는 cs5로 테스팅
    const getTotalSumQuery = `
    SELECT username,
           cost
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
    GROUP BY Z.user_idx;`;

    return new Promise((resolve, reject) => {
      connection.query(getTotalSumQuery, (err, res) => {
        if (err) return reject(err);
        return resolve(res);
      });
    });
  },
  getGroupList: (userid) => {
    const getGroupListQuery = `
    SELECT g.groupname
          FROM   groups g
          INNER JOIN  (SELECT gm.group_idx
                  FROM   groupmember gm
                  WHERE  (SELECT idx
                          FROM   user
                          WHERE  userid = "${userid}") = gm.user_idx)AS JOINEDGROUP
                          ON JOINEDGROUP.group_idx = g.idx; `;
    return new Promise((resolve, reject) => {
      connection.query(getGroupListQuery, (err, res) => {
        if (err) return reject(err);
        return resolve(res);
      });
    });
  },
  getGroupMember: (grouplist) => {
    let groupClause = `groupname = "${grouplist[0]}"`;
    for (let i = 1; i < grouplist.length; i += 1) {
      groupClause += ` OR groupname = "${grouplist[i]}"`;
    }
    const getGroupMemberQuery = `
    SELECT MemberId.groupname, u.username
    FROM   user u
          LEFT JOIN (SELECT gm.user_idx, GROUPLIST.groupname
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
  getHistory: (userid) => {
    const getHistoryQuery = `
    SELECT EVENTGROUPHISTORY.date,
       EVENTGROUPHISTORY.groupname,
       EVENTGROUPHISTORY.eventname,
       u.username,
       EVENTGROUPHISTORY.cost,
       EVENTGROUPHISTORY.ispaid
    FROM   user u
           INNER JOIN (SELECT EVENTHISTORY.date,
                              g.groupname,
                              EVENTHISTORY.recipient_idx,
                              EVENTHISTORY.eventname,
                              EVENTHISTORY.cost,
                              EVENTHISTORY.ispaid
                       FROM   groups g
                              INNER JOIN (SELECT e.eventname,
                                                 e.date,
                                                 e.group_idx,
                                                 e.recipient_idx,
                                                 EVENTLIST.cost,
                                                 EVENTLIST.ispaid
                                          FROM   event e
                                                 INNER JOIN (SELECT em.event_idx,
                                                                    em.cost,
                                                                    em.ispaid
                                                             FROM   eventmember em
                                                             WHERE  em.user_idx =
                                                                    (SELECT u.idx
                                                                     FROM   user u
                                                                     WHERE
    u.userid = "${userid}"))
    AS EVENTLIST
    ON EVENTLIST.event_idx = e.idx) AS
    EVENTHISTORY
    ON EVENTHISTORY.group_idx = g.idx) AS
    EVENTGROUPHISTORY
    ON u.idx = EVENTGROUPHISTORY.recipient_idx;
    `;
    return new Promise((resolve, reject) => {
      connection.query(getHistoryQuery, (err, res) => {
        if (err) return reject(err);
        return resolve(res);
      });
    });
  },
};
