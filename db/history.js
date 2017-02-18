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
  getDebtHistory: (userid) => {
    const getDebtHistoryQuery = `
    SELECT Date_format(eventgrouphistory.date, '%Y-%m-%d')                   AS date
           ,
           eventgrouphistory.groupname,
           eventgrouphistory.eventname,
           u.username,
           u.email,
           eventgrouphistory.cost,
           eventgrouphistory.ispaid,
           (SELECT status
            FROM   pendingevent
            WHERE  event_idx = eventgrouphistory.idx
                   AND user_idx = (SELECT idx
                                   FROM   user
                                   WHERE  userid = "${userid}")) AS
           status
    FROM   user u
           INNER JOIN (SELECT eventhistory.date,
                              g.groupname,
                              eventhistory.recipient_idx,
                              eventhistory.eventname,
                              eventhistory.cost,
                              eventhistory.ispaid,
                              eventhistory.idx
                       FROM   groups g
                              INNER JOIN (SELECT e.eventname,
                                                 e.date,
                                                 e.group_idx,
                                                 e.recipient_idx,
                                                 e.idx,
                                                 IF(recipient_idx = (SELECT idx
                                                                     FROM   user
                                                                     WHERE  userid =
                                                    "${userid}"
                                                    ),
                                                 -
                                                 eventlist.cost,
                                                 eventlist.cost) AS cost,
                                                 eventlist.ispaid
                                          FROM   event e
                                                 INNER JOIN (SELECT em.event_idx,
                                                                    em.cost,
                                                                    em.ispaid
                                                             FROM   eventmember em
                                                             WHERE  em.user_idx =
                                                                    (SELECT u.idx
                                                                     FROM   user u
                                                                     WHERE
                                                 u.userid = "${userid}"
                                                               )) AS
                                                         eventlist
                                                         ON eventlist.event_idx =
                                                            e.idx) AS
                                         eventhistory
                                      ON eventhistory.group_idx = g.idx
                                         AND eventhistory.recipient_idx <>
                                             (SELECT u.idx
                                              FROM   user u
                                              WHERE
                                             u.userid = "${userid}")) AS
                                    eventgrouphistory
                   ON u.idx = eventgrouphistory.recipient_idx
    ORDER  BY date DESC;
    `;
    return new Promise((resolve, reject) => {
      connection.query(getDebtHistoryQuery, (err, res) => {
        if (err) return reject(err);
        return resolve(res);
      });
    });
  },
  getLoanHistory: (userid) => {
    const getLoanHistoryQuery = `
    SELECT Date_format(eventgrouphistory.date, '%Y-%m-%d')    AS date,
           eventgrouphistory.groupname,
           eventgrouphistory.eventname,
           u.username,
           u.email,
           eventgrouphistory.cost,
           eventgrouphistory.ispaid,
           (SELECT status
            FROM   pendingevent
            WHERE  event_idx = eventgrouphistory.idx
                   AND user_idx = eventgrouphistory.user_idx) AS status
    FROM   user u
           INNER JOIN (SELECT eventhistory.date,
                              g.groupname,
                              eventhistory.user_idx,
                              eventhistory.eventname,
                              eventhistory.cost,
                              eventhistory.ispaid,
                              eventhistory.idx
                       FROM   groups g
                              INNER JOIN (SELECT e.eventname,
                                                 e.date,
                                                 e.group_idx,
                                                 e.idx,
                                                 eventlist.user_idx,
                                                 IF(recipient_idx = (SELECT idx
                                                                     FROM   user
                                                                     WHERE  userid =
                                                    "${userid}"
                                                    ),
                                                 -
                                                 eventlist.cost,
                                                 eventlist.cost) AS cost,
                                                 eventlist.ispaid
                                          FROM   event e
                              INNER JOIN (SELECT em.event_idx,
                                                 em.cost,
                                                 em.user_idx,
                                                 em.ispaid
                                          FROM   eventmember em
                                          WHERE
                              em.user_idx <> (SELECT
                              u.idx
                                              FROM
                              user u
                                              WHERE
                              u.userid = "${userid}"
                                             ))
                                      AS eventlist
                                      ON e.idx =
                              eventlist.event_idx
                                         AND e.recipient_idx =
                                             (SELECT idx
                                              FROM   user
                                              WHERE  userid =
                                             "${userid}"))
                                         AS
                                                          eventhistory
                                      ON eventhistory.group_idx = g.idx) AS
                                    eventgrouphistory
                   ON u.idx = eventgrouphistory.user_idx
    ORDER  BY date DESC;
    `;
    return new Promise((resolve, reject) => {
      connection.query(getLoanHistoryQuery, (err, res) => {
        if (err) return reject(err);
        return resolve(res);
      });
    });
  },
  insertResolvedLoanEvent: (body) => {
    const insertResolvedLoanEventQuery = `
    INSERT INTO pendingevent
                (user_idx,
                 event_idx,
                 status,
                 isrecipient)
    VALUES      ((SELECT idx
                  FROM   user
                  WHERE  email = '${body.recipientemail}'),
                 (SELECT idx
                  FROM   event
                  WHERE  eventname = '${body.eventname}'
                         AND date = '${body.date}'
                         AND group_idx = (SELECT idx
                                          FROM   groups
                                          WHERE  groupname = '${body.groupname}')),
                 2,
                 1);
                  `;
    return new Promise((resolve, reject) => {
      connection.query(insertResolvedLoanEventQuery, (err) => {
        if (err) return reject(err);
        return resolve();
      });
    });
  },
  rejectPendingLoanEvent: (body) => {
    const rejectPendingLoanEventQuery = `
    UPDATE pendingevent
    SET status = 3
    WHERE user_idx = (SELECT idx
                  FROM   user
                  WHERE  email = '${body.recipientemail}')
          AND
          event_idx = (SELECT idx
                  FROM   event
                  WHERE  eventname = '${body.eventname}'
                         AND date = '${body.date}'
                         AND group_idx = (SELECT idx
                                          FROM   groups
                                          WHERE  groupname = '${body.groupname}'))
    ;
                  `;
    return new Promise((resolve, reject) => {
      connection.query(rejectPendingLoanEventQuery, (err) => {
        if (err) return reject(err);
        return resolve();
      });
    });
  },
  acceptPendingLoanEvent: (body) => {
    const accpetPendingLoanEventQuery = `
    UPDATE pendingevent
    SET status = 2
    WHERE user_idx = (SELECT idx
                  FROM   user
                  WHERE  email = '${body.recipientemail}')
          AND
          event_idx = (SELECT idx
                  FROM   event
                  WHERE  eventname = '${body.eventname}'
                         AND date = '${body.date}'
                         AND group_idx = (SELECT idx
                                          FROM   groups
                                          WHERE  groupname = '${body.groupname}'))
    ;
                  `;
    return new Promise((resolve, reject) => {
      connection.query(accpetPendingLoanEventQuery, (err) => {
        if (err) return reject(err);
        return resolve();
      });
    });
  },

  insertPendingDebtEvent: (body) => {
    const insertPendingDebtEventQuery = `
    INSERT INTO pendingevent
                (user_idx,
                 event_idx,
                 status,
                 isrecipient)
    VALUES      ((SELECT idx
                  FROM   user
                  WHERE  userid = '${body.currentUser}'),
                 (SELECT idx
                  FROM   event
                  WHERE  eventname = '${body.eventname}'
                         AND date = '${body.date}'
                         AND group_idx = (SELECT idx
                                          FROM   groups
                                          WHERE  groupname = '${body.groupname}')),
                 1,
                 1);
                  `;
    return new Promise((resolve, reject) => {
      connection.query(insertPendingDebtEventQuery, (err) => {
        if (err) return reject(err);
        return resolve();
      });
    });
  },
  checkPendingLoan: (body) => {
    const checkPendingLoanQuery = `
    SELECT status
    FROM   pendingevent
    WHERE  user_idx = (SELECT idx
                       FROM   user
                       WHERE  email = '${body.recipientemail}')
           AND event_idx = (SELECT idx
                            FROM   event
                            WHERE  eventname = '${body.eventname}'
                                   AND date = '${body.date}'
                                   AND group_idx = (SELECT idx
                                                    FROM   groups
                                                    WHERE
                                       groupname = '${body.groupname}')
                           );
    `;
    return new Promise((resolve, reject) => {
      connection.query(checkPendingLoanQuery, (err, res) => {
        if (err) return reject(err);
        return resolve(res);
      });
    });
  },
  checkPendingDebt: (body) => {
    const checkPendingDebtQuery = `
    SELECT status
    FROM   pendingevent
    WHERE  user_idx = (SELECT idx
                       FROM   user
                       WHERE  userid = '${body.currentUser}')
           AND event_idx = (SELECT idx
                            FROM   event
                            WHERE  eventname = '${body.eventname}'
                                   AND date = '${body.date}'
                                   AND group_idx = (SELECT idx
                                                    FROM   groups
                                                    WHERE
                                       groupname = '${body.groupname}')
                           );
    `;
    return new Promise((resolve, reject) => {
      connection.query(checkPendingDebtQuery, (err, res) => {
        if (err) return reject(err);
        return resolve(res);
      });
    });
  },


  toggleLoanPayment: (body) => {
    const toggleLoanPaymentQuery = `
    UPDATE eventmember
    SET    ispaid = ${body.ispaid}
    WHERE  user_idx = (SELECT idx
                       FROM   user
                       WHERE  email = '${body.recipientemail}')
                       AND event_idx = (SELECT idx
                               FROM   event
                               WHERE  eventname = '${body.eventname}'
                                      AND date = '${body.date}'
                                      AND group_idx = (SELECT idx
                                                       FROM   groups
                                                       WHERE
                                          groupname = '${body.groupname}')); `;
    return new Promise((resolve, reject) => {
      connection.query(toggleLoanPaymentQuery, (err) => {
        if (err) return reject(err);
        return resolve();
      });
    });
  },
  toggleDebtPayment: (body) => {
    const toggleDebtPaymentQuery = `
    UPDATE eventmember
    SET    ispaid = ${body.ispaid}
    WHERE  user_idx = (SELECT idx
                       FROM   user
                       WHERE  userid = '${body.currentUser}')
                       AND event_idx = (SELECT idx
                               FROM   event
                               WHERE  eventname = '${body.eventname}'
                                      AND date = '${body.date}'
                                      AND group_idx = (SELECT idx
                                                       FROM   groups
                                                       WHERE
                                          groupname = '${body.groupname}')); `;
    return new Promise((resolve, reject) => {
      connection.query(toggleDebtPaymentQuery, (err) => {
        if (err) return reject(err);
        return resolve();
      });
    });
  },
};
