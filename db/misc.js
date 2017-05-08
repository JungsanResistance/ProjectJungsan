const mysql = require('mysql');
const keys = require('../keys/keys');

const connection = mysql.createConnection(keys.AWSdb);


module.exports = {
  /**
   * get email and username of the current user
   * @param {string} userid - the id of the current user.
   * @return {array} res - a list containing an object which includes details on the current user
   */
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

  /**
   * get all pending events related to the current user
   * @param {string} userid - the id of the current user.
   * @return {array} res - a list of pending events
   */
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

  /**
   * get transaction status between two users
   * @param {string} body.recipientemail - the email of the recipient.
   * @param {string} userid - the id of the current user.
   * @return {array} res - a list containing the transaction status between two users
   */
  checkStatus: (recipientemail, userid) => {
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
                                 WHERE  email = '${recipientemail}')
           AND acceptor_idx = (SELECT idx
                                   FROM   user
                                   WHERE  userid = '${userid}')
      ; `;

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
        WHERE  acceptor_idx = (SELECT idx
                                FROM   user
                                WHERE  email = '${recipientemail}')
               AND applicant_idx = (SELECT idx
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

  /**
   * create new pending transaction status between two users
   * @param {string} body.recipientemail - the email of the recipient.
   * @param {string} userid - the id of the current user.
   * @return {error} err - return err if error occurs, nothing if successful
   */
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

  /**
   * rejects current pending transaction status between two users
   * @param {string} body.applicantemail - the email of the applicant(person who requested transaction).
   * @param {string} body.acceptoremail - the email of the acceptor(person who received transaction).
   * @return {error} err - return err if error occurs, nothing if successful
   */
  rejectPending: (body) => {
    const rejectPendingquery = `
    DELETE FROM pendinguser
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

  /**
   * updates rejected transaction to pending status between two users
   * @param {string} body.applicantemail - the email of the applicant(person who requested transaction).
   * @param {string} body.acceptoremail - the email of the acceptor(person who received transaction).
   * @return {error} err - return err if error occurs, nothing if successful
   */
  updatePending: (body) => {
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

  /**
   * resolves all payments, including current pending transactions, between two users
   * @param {string} body.recipientemail - the email of the recipient.
   * @param {string} userid - the id of the current user.
   * @return {error} err - return err if error occurs, nothing if successful
   */
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
      return new Promise((resolve, reject) => {
        connection.query(inDebtEventListQuery, (err, res) => {
          if (err) return reject(err);
          resolve(res);
        });
      })
    })
    .then((inDebtEventList) => {
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
            if (err) return reject(err);
            resolve(res);
          });
        });
      }
    })
    .then((res) => {
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
    .then(() => {
      const resolveEventsQuery =
      `
      UPDATE pendingevent
             INNER JOIN (SELECT idx
                         FROM   event
                         WHERE  recipient_idx = (SELECT idx
                                                 FROM   user
                                                 WHERE  userid = '${userid}')
                                 OR recipient_idx = (SELECT idx
                                                     FROM   user
                                                     WHERE  email = '${body.recipientemail}')) A
                     ON pendingevent.event_idx = A.idx
      SET    status = 2
      WHERE  user_idx = (SELECT idx
                         FROM   user
                         WHERE  userid = '${userid}')
              OR user_idx = (SELECT idx
                             FROM   user
                             WHERE  email = '${body.recipientemail}')
      ; `;
      return new Promise((resolve, reject) => {
        connection.query(resolveEventsQuery, (err, res) => {
          if (err) return reject(err);
          resolve(res);
        });
      });
    })
    .then((res) => {
      return new Promise((resolve, reject) => {
        connection.commit((err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    })
    .catch((err) => {
      connection.rollback();
      return Promise.reject(err);
    });
  },
};
