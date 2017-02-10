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
  markAllToBePaid: (body, userid) => {
    const checkToBePaidQuery = `
    SELECT user_idx,
           event_idx
    FROM   eventmember
           INNER JOIN (SELECT idx
                       FROM   event
                       WHERE  recipient_idx = (SELECT idx
                                               FROM   user
                                               WHERE  email = '${body.recipient}')) AS
                      A
                   ON A.idx = event_idx
                      AND eventmember.user_idx = (SELECT idx
                                                  FROM   user
                                                  WHERE  userid = '${userid}')
    ;  `;
    return new Promise((resolve, reject) => {
      connection.query(checkToBePaidQuery, (err, res) => {
        if (err) return reject(err);
        return resolve(res);
      });
    })
    .then((eventList) => {
      let totalPaymentquery = `
      UPDATE eventmember
      SET    ispaid = true
      WHERE  user_idx = ${eventList[0].user_idx}
             AND event_idx = ${eventList[0].event_idx};
      `;
      eventList.forEach((event) => {
        totalPaymentquery += `
        UPDATE eventmember
        SET    ispaid = true
        WHERE  user_idx = ${event.user_idx}
               AND event_idx = ${event.event_idx};
        `;
        connection.query(totalPaymentquery, (err, res) => {
          if (err) throw err;
          return res;
        });
      });
    });
  },
  markAllToBeReceived: (body, userid) => {
    const checkToBePaidQuery = `
    SELECT user_idx,
           event_idx
    FROM   eventmember
           INNER JOIN (SELECT idx
                       FROM   event
                       WHERE  recipient_idx = (SELECT idx
                                               FROM   user
                                               WHERE  userid = '${userid}')) AS
                      A
                   ON A.idx = event_idx
                      AND eventmember.user_idx = (SELECT idx
                                                  FROM   user
                                                  WHERE  email = '${body.recipient}')
    ;  `;
    return new Promise((resolve, reject) => {
      connection.query(checkToBePaidQuery, (err, res) => {
        if (err) return reject(err);
        return resolve(res);
      });
    })
    .then((eventList) => {
      let totalPaymentquery = '';
      eventList.forEach((event) => {
        totalPaymentquery += `
        UPDATE eventmember
        SET    ispaid = true
        WHERE  user_idx = ${event.user_idx}
               AND event_idx = ${event.event_idx};
        `;
        connection.query(totalPaymentquery, (err, res) => {
          if (err) throw err;
          return res;
        });
      });
    });
  },
};
