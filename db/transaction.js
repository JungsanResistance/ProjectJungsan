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
  getGroupMember: (grouplist) => {
    console.log(grouplist);
    let groupClause = `groupname = "${grouplist[0].groupname}"`;
    for (let i = 1; i < grouplist.length; i += 1) {
      groupClause += ` OR groupname = "${grouplist[i].groupname}"`;
    }
    const getGroupMemberQuery = `
    SELECT MemberId.groupname, u.username, u.email, MemberId.active
    FROM   user u
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
  postTransaction: (body) => {
    const createEventQuery = `
    INSERT INTO event (group_idx, date, recipient_idx, eventname, totalcost) VALUES (
    (SELECT idx FROM groups where groupname='${body.groupname}'),
    STR_TO_DATE('${body.date}', '%Y-%m-%d'),
    (SELECT idx FROM user where username='${body.recipient}'),
    '${body.eventName}',
    ${body.cost}
  );`;
    let addEventMemberQuery = '';
    const participants = [...body.selectedUserList];
    const costPerPerson = Math.floor(body.cost / participants.length);
    participants.forEach((name) => {
      let isPaid = 'FALSE';
      if (name === body.recipient) {
        isPaid = 'TRUE';
      }
      addEventMemberQuery += `
      INSERT INTO eventmember (user_idx, event_idx, cost, ispaid) VALUES (
      (SELECT idx FROM user where username='${name}'),
      (SELECT idx FROM event where eventname='${body.eventName}'),
      ${costPerPerson},
      ${isPaid}
    );`;
    });
    return new Promise((resolve, reject) => {
      const totalQuery = createEventQuery + addEventMemberQuery;
      connection.query(totalQuery, (err) => {
        if (err) return reject(err);
        return resolve();
      });
    });
  },
};
