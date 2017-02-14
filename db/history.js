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
  getHistory: (userid) => {
    const getHistoryQuery = `
    SELECT Date_format(EVENTGROUPHISTORY.date, '%Y-%m-%d')AS date,
       EVENTGROUPHISTORY.groupname,
       EVENTGROUPHISTORY.eventname,
       u.username,
       u.email,
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
                                             IF(recipient_idx = (SELECT idx
                                                                 FROM   user
                                                                 WHERE  userid =
                                                "${userid}"
                                                ),
                                             -EVENTLIST.cost, EVENTLIST.cost) AS
                                             cost,
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
                                             u.userid = "${userid}"
                                                           )) AS
                                                     EVENTLIST
                                                     ON EVENTLIST.event_idx =
                                                        e.idx) AS
                                     EVENTHISTORY
                                  ON EVENTHISTORY.group_idx = g.idx) AS
                                EVENTGROUPHISTORY
               ON u.idx = EVENTGROUPHISTORY.recipient_idx
    ORDER  BY date DESC;
    `;
    return new Promise((resolve, reject) => {
      connection.query(getHistoryQuery, (err, res) => {
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
                       WHERE  userid = '${body.currentuser}')
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
