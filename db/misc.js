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
  checkAllPending: (userid) => {
    const checkPendingquery = `
    SELECT (SELECT username
            FROM   user u
            WHERE  idx = pendinguser.applicant_idx) AS applicant,
           (SELECT email
            FROM   user u
            WHERE  idx = pendinguser.applicant_idx) AS applicantemail,
           (SELECT username
            FROM   user u
            WHERE  idx = pendinguser.acceptor_idx)  AS acceptor,
           (SELECT email
            FROM   user u
            WHERE  idx = pendinguser.acceptor_idx)  AS acceptoremail,
           status
    FROM   pendinguser
    WHERE  applicant_idx = (SELECT idx
                            FROM   user
                            WHERE  userid = '${userid}')
           OR acceptor_idx = (SELECT idx
                                   FROM   user
                                   WHERE  userid = '${userid}')
    ; `;
    return new Promise((resolve, reject) => {
      connection.query(checkPendingquery, (err, res) => {
        if (err) return reject(err);
        resolve(res);
      });
    });
  },
  checkStatus: (body, userid) => {
    let checkStatusQuery = `
    SELECT (SELECT username
            FROM   user u
            WHERE  idx = pendinguser.applicant_idx) AS applicant,
           (SELECT email
            FROM   user u
            WHERE  idx = pendinguser.applicant_idx) AS applicantemail,
           (SELECT username
            FROM   user u
            WHERE  idx = pendinguser.acceptor_idx)  AS acceptor,
           (SELECT email
            FROM   user u
            WHERE  idx = pendinguser.acceptor_idx)  AS acceptoremail,
           status
    FROM   pendinguser
    WHERE  applicant_idx = (SELECT idx
                            FROM   user
                            WHERE  userid = '${userid}')
           AND acceptor_idx = (SELECT idx
                               FROM   user
                               WHERE  email = '${body.recipientemail}')
    ; `;
    console.log(checkStatusQuery)
    return new Promise((resolve, reject) => {
      connection.query(checkStatusQuery, (err, res) => {
        if (err) return reject(err);
        resolve(res);
      });
    })
    .then((result) => {
      if (result.length) {
        return result;
      } else {
        checkStatusQuery = `
        SELECT (SELECT username
                FROM   user u
                WHERE  idx = pendinguser.applicant_idx) AS applicant,
                (SELECT username
                 FROM   user u
                 WHERE  idx = pendinguser.applicant_idx) AS applicantemail,
                (SELECT username
                 FROM   user u
                 WHERE  idx = pendinguser.acceptor_idx)  AS acceptor,
                (SELECT username
                 FROM   user u
                 WHERE  idx = pendinguser.acceptor_idx)  AS acceptoremail,
               status
        FROM   pendinguser
        WHERE  applicant_idx = (SELECT idx
                                FROM   user
                                WHERE  email = '${body.recipientemail}')
               AND acceptor_idx = (SELECT idx
                                   FROM   user
                                   WHERE  userid = '${userid}')
        ; `;
        return new Promise((resolve, reject) => {
          connection.query(checkStatusQuery, (err, res) => {
            if (err) return reject(err);
            resolve(res);
          });
        });
      }
    })
    .then(result => result);
  },
  insertPending: (body, userid) => {
    const insertPendingquery = `
    INSERT INTO pendinguser (applicant_idx, acceptor_idx, status)
    VALUES ((SELECT idx
            FROM   user
            WHERE  userid = '${userid}'),
           (SELECT idx
             FROM   user
             WHERE  email = '${body.recipientemail}'),
             1)
    ; `;
    return new Promise((resolve, reject) => {
      connection.query(insertPendingquery, (err, res) => {
        if (err) return reject(err);
        resolve(res);
      });
    });
  },
  rejectPending: (body, userid) => {
    const rejectPendingquery = `
    UPDATE pendinguser set status = 3
    WHERE  applicant_idx = (SELECT idx
                            FROM   user
                            WHERE  email = '${body.applicantemail}')
           AND acceptor_idx = (SELECT idx
                               FROM   user
                               WHERE  email = '${body.acceptoremail}')
    ; `;
    return new Promise((resolve, reject) => {
      connection.query(rejectPendingquery, (err, res) => {
        if (err) return reject(err);
        resolve(res);
      });
    });
  },
  updatePending: (body, userid) => {
    const updatePendingquery = `
    UPDATE pendinguser set status = 1
    WHERE  applicant_idx = (SELECT idx
                            FROM   user
                            WHERE  email = '${body.applicantemail}')
           AND acceptor_idx = (SELECT idx
                               FROM   user
                               WHERE  email = '${body.acceptoremail}')
    ; `;
    return new Promise((resolve, reject) => {
      connection.query(updatePendingquery, (err, res) => {
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
      console.log('delete')
      const deleteAcceptedPendingQuery = `
      DELETE FROM pendinguser
      WHERE  applicant_idx = (SELECT idx
                              FROM   user
                              WHERE  email = '${body.recipientemail}')
             AND acceptor_idx = (SELECT idx
                                 FROM   user
                                 WHERE  userid = '${userid}')
      ;  `;
      return new Promise((resolve, reject) => {
        connection.query(deleteAcceptedPendingQuery, (err, res) => {
          if (err) return reject(err);
          resolve(res);
        });
      })
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
