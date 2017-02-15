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
  getEventDetail: (groupname, eventname, date) => {
    const getEventDetailQuery = `
    SELECT g.groupname,
           DATE_FORMAT(SPECIFIEDEVENT.date,'%Y-%m-%d')AS date,
           SPECIFIEDEVENT.eventname
    FROM   groups g
           INNER JOIN (SELECT *
                       FROM   event
                       WHERE  eventname = '${eventname}'
                              AND date = '${date}'
                              AND group_idx = (SELECT idx
                                               FROM   groups
                                               WHERE
                                  groupname = '${groupname}')) AS
                                      SPECIFIEDEVENT
                   ON g.idx = SPECIFIEDEVENT.group_idx;  `;
    return new Promise((resolve, reject) => {
      connection.query(getEventDetailQuery, (err, res) => {
        if (err) return reject(err);
        return resolve(res);
      });
    });
  },
  getParticipantsDetail: (groupname, eventname, date) => {
    const getParticipantsDetailQuery = `
    SELECT u.username,
           u.email,
           SPECIFIEDEVENTMEMBERS.cost,
           SPECIFIEDEVENTMEMBERS.ispaid
    FROM   user u
           INNER JOIN (SELECT *
                       FROM   eventmember
                       WHERE  event_idx = (SELECT idx
                                           FROM   event
                                           WHERE  eventname = '${eventname}'
                                                  AND date = '${date}'
                                                  AND group_idx = (SELECT idx
                                                                   FROM   groups
                                                                   WHERE
                                                      groupname =
                                                      '${groupname}')))
                                    AS SPECIFIEDEVENTMEMBERS
                   ON u.idx = SPECIFIEDEVENTMEMBERS.user_idx; `;
    return new Promise((resolve, reject) => {
      connection.query(getParticipantsDetailQuery, (err, res) => {
        if (err) return reject(err);
        return resolve(res);
      });
    });
  },
  getRecipientDetail: (groupname, eventname, date) => {
    const getRecipientDetailQuery = `
    SELECT u.username,
           u.email,
           em.cost,
           em.ispaid
    FROM   user u
           INNER JOIN (SELECT idx,
                              recipient_idx
                       FROM   event
                       WHERE  eventname = '${eventname}'
                              AND date = '${date}'
                              AND group_idx = (SELECT idx
                                               FROM   groups
                                               WHERE
                                  groupname = '${groupname}')) e
                   ON u.idx = e.recipient_idx
           INNER JOIN eventmember em
                   ON em.user_idx = u.idx
                      AND em.event_idx = e.idx;   `;
    return new Promise((resolve, reject) => {
      connection.query(getRecipientDetailQuery, (err, res) => {
        if (err) return reject(err);
        return resolve(res);
      });
    });
  },
  postTransaction: (body) => {
    const createEventQuery = `
    INSERT INTO event (group_idx, date, recipient_idx, eventname) VALUES (
    (SELECT idx FROM groups where groupname='${body.groupname}'),
    STR_TO_DATE('${body.date}', '%Y-%m-%d'),
    (SELECT idx FROM user where email='${body.newrecipient.email}'),
    '${body.eventname}'
    ); `;

    const addEventCreatorQuery = `
    INSERT INTO eventadmin (event_idx, admin_idx) VALUES (
      (SELECT idx
              FROM   event
              WHERE  eventname = '${body.eventname}'
                     AND date = '${body.date}'
                     AND group_idx = (SELECT idx
                                      FROM   groups
                                      WHERE
                         groupname = '${body.groupname}')),
      (SELECT idx FROM user where userid = ${body.userid})
    );
    `;
    let addGroupAdmintoEventQuery = '';
    if (!body.isadmin) {
      addGroupAdmintoEventQuery = `
      INSERT INTO eventadmin (event_idx, admin_idx) VALUES (
        (SELECT idx
                FROM   event
                WHERE  eventname = '${body.eventname}'
                       AND date = '${body.date}'
                       AND group_idx = (SELECT idx
                                        FROM   groups
                                        WHERE
                           groupname = '${body.groupname}')),
        (SELECT idx
                FROM user
                WHERE idx = (SELECT admin_idx
                                    FROM groupadmin
                                    WHERE group_idx = (SELECT idx
                                                        FROM groups
                                                        WHERE
                                      groupname = '${body.groupname}')))
      );
      `;
    }
    console.log(addGroupAdmintoEventQuery);
    let addEventMemberQuery = '';
    const participants = [...body.participants];
    participants.forEach((member) => {
      addEventMemberQuery += `
      INSERT INTO eventmember (user_idx, event_idx, cost, ispaid) VALUES (
      (SELECT idx FROM user where email='${member.email}'),
      (SELECT idx FROM event where eventname='${body.eventname}'),
      ${member.cost},
      ${member.ispaid}
    );`;
    });
    return new Promise((resolve, reject) => {
      const totalQuery = createEventQuery + addEventCreatorQuery + addGroupAdmintoEventQuery + addEventMemberQuery;
      connection.query(totalQuery, (err) => {
        if (err) return reject(err);
        return resolve();
      });
    });
  },
  updateEventDetail: (body) => {
    const updateEventNameQuery = `
    UPDATE event
    SET    eventname = '${body.neweventname}'
    WHERE  idx = (SELECT *
                  FROM   (SELECT idx
                          FROM   event
                          WHERE  eventname = '${body.oldeventname}'
                                 AND date = '${body.olddate}'
                                 AND group_idx = (SELECT idx
                                                  FROM   groups
                                                  WHERE
                                     groupname = '${body.groupname}'))
                         AS
                         exactEventIndex);
    `;
    const updateEventDateQuery = `
    UPDATE event
    SET    date = '${body.newdate}'
    WHERE  idx = (SELECT *
                  FROM   (SELECT idx
                          FROM   event
                          WHERE  eventname = '${body.neweventname}'
                                 AND date = '${body.olddate}'
                                 AND group_idx = (SELECT idx
                                                  FROM   groups
                                                  WHERE
                                     groupname = '${body.groupname}'))
                         AS
                         exactEventIndex);
    `;
    const updateRecipientQuery = `
    UPDATE event
    SET    recipient_idx = (SELECT idx FROM user where email = '${body.newrecipient.email}')
    WHERE  idx = (SELECT *
                  FROM   (SELECT idx
                          FROM   event
                          WHERE  eventname = '${body.neweventname}'
                                 AND date = '${body.newdate}'
                                 AND group_idx = (SELECT idx
                                                  FROM   groups
                                                  WHERE
                                     groupname = '${body.groupname}'))
                         AS
                         exactEventIndex);
    `;
    return new Promise((resolve, reject) => {
      const totalUpdateQuery = updateEventNameQuery + updateEventDateQuery + updateRecipientQuery;
      connection.query(totalUpdateQuery, (err) => {
        if (err) return reject(err);
        return resolve();
      });
    });
  },
  updateEventAddParticipants: (body) => {
    let updateEventAddParticipantsQuery = '';
    body.participants.forEach((participant) => {
      updateEventAddParticipantsQuery += `
      INSERT INTO eventmember
                  (user_idx,
                   event_idx,
                   cost,
                   ispaid)
      SELECT (SELECT idx
              FROM   user
              WHERE  email = '${participant.email}'),
             (SELECT idx
              FROM   event
              WHERE  eventname = '${body.neweventname}'
                     AND date = '${body.newdate}'
                     AND group_idx = (SELECT idx
                                      FROM   groups
                                      WHERE  groupname = '${body.groupname}')),
             5000,
             false
      FROM   DUAL
      WHERE  NOT EXISTS (SELECT user_idx
                         FROM   eventmember
                         WHERE  user_idx = (SELECT idx
                                            FROM   user
                                            WHERE  email = '${participant.email}')
                                AND event_idx = (SELECT idx
                                                 FROM   event
                                                 WHERE  eventname = '${body.neweventname}'
                                                        AND date = '${body.newdate}'
                                                        AND group_idx = (SELECT idx
                                                                         FROM   groups
                                                                         WHERE
                                                            groupname =
                                                            '${body.groupname}'
                                                            )));
      `;
    });
    return new Promise((resolve, reject) => {
      connection.query(updateEventAddParticipantsQuery, (err) => {
        if (err) return reject(err);
        return resolve();
      });
    });
  },
  updateEventDropParticipants: (body) => {
    let updateEventDropParticipantsQuery = '';
    body.dropped.forEach((emailOfToBeDropped) => {
      updateEventDropParticipantsQuery = `
      DELETE FROM eventmember
      WHERE  user_idx = (SELECT idx
                         FROM   user
                         WHERE  email = '${emailOfToBeDropped}')
             AND event_idx = (SELECT *
                              FROM   (SELECT idx
                                      FROM   event
                                      WHERE  eventname = '${body.neweventname}'
                                             AND date = '${body.newdate}'
                                             AND group_idx = (SELECT idx
                                                              FROM   groups
                                                              WHERE
                                                 groupname = '${body.groupname}')) AS
                                     exactEventIndex)
      ; `;
    });
    console.log(updateEventDropParticipantsQuery);
    return new Promise((resolve, reject) => {
      connection.query(updateEventDropParticipantsQuery, (err) => {
        if (err) return reject(err);
        return resolve();
      });
    });
  },
};
