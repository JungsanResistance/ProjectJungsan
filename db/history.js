const mysql = require('mysql');
const keys = require('../keys/keys');

const connection = mysql.createConnection({
  host: 'projectjungsan.ctkksl4fom4l.ap-northeast-2.rds.amazonaws.com',
  port: 3306,
  user: keys.AWSdb.user,
  password: keys.AWSdb.password,
  database: keys.AWSdb.database,
  multipleStatements: true,
});

module.exports = {

  /**
   * gets all the events of where the user is endebted to
   * @param {string} userid - the id of current user.
   * @return {array} res - the list of debt events
   */
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

  /**
   * gets all the events of where the user has payed money in
   * @param {string} userid - the id of current user.
   * @return {array} res - the list of loaned events (each event entry is separated per participant)
   */
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

  /**
   * inserts done status for a resolved loan event (if transaction occurred at mypage stage) ref. db/misc.js
   * @param {string} body.recipientemail - the email of the recipient.
   * @param {string} body.eventname - the name of corresponding event.
   * @param {string} body.groupname - name of the group in which the corresponding event occurred.
   * @param {string} body.date - the date of corresponding event.
   * @return {error} err - return err if error occurs, return nothing if successful
   */
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

  /**
   * rejects the proposal to resolve loan event
   * @param {string} body.recipientemail - the email of the recipient.
   * @param {string} body.eventname - the name of corresponding event.
   * @param {string} body.groupname - name of the group in which the corresponding event occurred.
   * @param {string} body.date - the date of corresponding event.
   * @return {error} err - return err if error occurs, return nothing if successful
   */
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

  /**
   * accepts the pending proposal to resolve a loan event
   * @param {string} body.recipientemail - the email of the recipient.
   * @param {string} body.eventname - the name of corresponding event.
   * @param {string} body.groupname - name of the group in which the corresponding event occurred.
   * @param {string} body.date - the date of corresponding event.
   * @return {error} err - return err if error occurs, return nothing if successful
   */
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

  /**
   * inserts a pending status into event and send request
   * @param {string} body.currentUser - the id of current user
   * @param {string} body.eventname - the name of corresponding event.
   * @param {string} body.groupname - name of the group in which the corresponding event occurred.
   * @param {string} body.date - the date of corresponding event.
   * @return {error} err - return err if error occurs, return nothing if successful
   */
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

  /**
   * checks whether a pending request received from others exist for a specified loan event
   * @param {string} body.recipientemail - the email of the recipient.
   * @param {string} body.eventname - the name of corresponding event.
   * @param {string} body.groupname - name of the group in which the corresponding event occurred.
   * @param {string} body.date - the date of corresponding event.
   * @return {array} res - !length if no pending request, length if exist
   */
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

  /**
   * checks whether a pending request received from others exist for a specified debt event
   * @param {string} body.recipientemail - the email of the recipient.
   * @param {string} body.eventname - the name of corresponding event.
   * @param {string} body.groupname - name of the group in which the corresponding event occurred.
   * @param {string} body.date - the date of corresponding event.
   * @return {array} res - !length if no pending request, length if exist
   */
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

 /**
  * mark ispaid = true for accepted loan payment events, revert if opposite
  * @param {string} body.ispaid - the future status asked to be changed
  * @param {string} body.currentUser - the id of current user
  * @param {string} body.eventname - the name of corresponding event.
  * @param {string} body.groupname - name of the group in which the corresponding event occurred.
  * @param {string} body.date - the date of corresponding event.
  * @return {error} err - return err if error occurs, return nothing if successful
  */
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

  /**
   * mark ispaid = true for accepted debt payment events, revert if opposite
   * @param {string} body.ispaid - the future status asked to be changed
   * @param {string} body.currentUser - the id of current user
   * @param {string} body.eventname - the name of corresponding event.
   * @param {string} body.groupname - name of the group in which the corresponding event occurred.
   * @param {string} body.date - the date of corresponding event.
   * @return {error} err - return err if error occurs, return nothing if successful
   */
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
