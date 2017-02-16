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
  getSelf: (userid) => {
    const getSelfQuery = `
    SELECT username, email
    FROM   user
    WHERE  userid = '${userid}';
    `;
    return new Promise((resolve, reject) => {
      connection.query(getSelfQuery, (err, res) => {
        if (err) return reject(err);
        resolve(res);
      });
    });
  },
  resolveAllPayments: (body, userid) => {
    return new Promise((resolve, reject) => {
      connection.beginTransaction((err) => {
        if (err) return reject(err);
        resolve();
      });
    })
    .then(() => {
      const inDebtEventListQuery = `
      SELECT user_idx,
             event_idx
      FROM   eventmember
             INNER JOIN (SELECT idx
                         FROM   event
                         WHERE  recipient_idx = (SELECT idx
                                                 FROM   user
                                                 WHERE  email = '${body.recipientemail}')) AS
                        A
                     ON A.idx = event_idx
                        AND eventmember.user_idx = (SELECT idx
                                                    FROM   user
                                                    WHERE  userid = '${userid}')
      ;  `;
      console.log(inDebtEventListQuery);
      return new Promise((resolve, reject) => {
        connection.query(inDebtEventListQuery, (err, res) => {
          if (err) return reject(err);
          resolve(res);
        });
      })
    })
    .then((inDebtEventList) => {
      console.log(inDebtEventList);
      let resolvingDebtQuery = '';
      if (inDebtEventList.length) {
        inDebtEventList.forEach((event) => {
          resolvingDebtQuery += `
          UPDATE eventmember
          SET    ispaid = true
          WHERE  user_idx = ${event.user_idx}
                 AND event_idx = ${event.event_idx};
          `;
        });
        return new Promise((resolve, reject) => {
          connection.query(resolvingDebtQuery, (err, res) => {
            console.log('resolvingDebt')
            if (err) return reject(err);
            resolve(res);
          });
        });
      }
    })
    .then((res) => {
      console.log('loan')
      const loanedEventListQuery = `
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
                                                    WHERE  email = '${body.recipientemail}')
      ;  `;
      return new Promise((resolve, reject) => {
        connection.query(loanedEventListQuery, (err, res) => {
          if (err) return reject(err);
          resolve(res);
        });
      })
    })
    .then((loanedEventList) => {
      let resolvingLoanedQuery = '';
      console.log(loanedEventList)
      if (loanedEventList.length) {
        loanedEventList.forEach((event) => {
          resolvingLoanedQuery += `
          UPDATE eventmember
          SET    ispaid = true
          WHERE  user_idx = ${event.user_idx}
                 AND event_idx = ${event.event_idx};
          `;
        });
        return new Promise((resolve, reject) => {
          connection.query(resolvingLoanedQuery, (err, res) => {
            if (err) return reject(err);
            resolve(res);
          });
        });
      }
    })
    .then((res) => {
      return new Promise((resolve, reject) => {
        connection.commit((err) => {
          if (err) return reject(err);
          resolve();
        });
      });
      console.log('transaction complete!');
    })
    .catch((err) => {
      console.log('Error in Transaction');
      connection.rollback();
      return Promise.reject(err);
    });
  },
};
