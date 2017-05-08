const mysql = require('mysql');
const keys = require('../keys/keys');

const connection = mysql.createConnection(keys.AWSdb);

module.exports = {
  /**
   * get the details of specified existing event
   * @param {string} groupname - the name of the group under which event took place.
   * @param {string} eventname - the name of the event.
   * @param {string} date - the date of the event.
   * @return {array} res - the list of object containing the detail of the event.
   */
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

  /**
   * get the participants of specified existing event
   * @param {string} groupname - the name of the group under which event took place.
   * @param {string} eventname - the name of the event.
   * @param {string} date - the date of the event.
   * @return {array} res - the list of objects containing the details of the participants.
   */
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

  /**
   * get the recipient of specified existing event
   * @param {string} groupname - the name of the group under which event took place.
   * @param {string} eventname - the name of the event.
   * @param {string} date - the date of the event.
   * @return {array} res - the list of object containing the detail of the recipient of the event.
   */
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

  /**
   * create new event
   * @param {string} body.groupname - the name of the group under which event took place.
   * @param {string} body.eventname - the name of the event.
   * @param {string} body.date - the date of the event.
   * @param {object} body.newrecipient - details of the recipient of the event.
   * @param {boolean} body.isadmin - whether the current creator is a group admin or not.
   * @param {array} body.participants - the list of the details about the participants.
   * @return {error} err - return err if error, nothing if successful
   */
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
    let addEventMemberQuery = '';
    const participants = [...body.participants];
    participants.forEach((member) => {
      addEventMemberQuery += `
      INSERT INTO eventmember (user_idx, event_idx, cost, ispaid) VALUES (
      (SELECT idx FROM user where email='${member.email}'),
      (SELECT idx
              FROM   event
              WHERE  eventname = '${body.eventname}'
                     AND date = '${body.date}'
                     AND group_idx = (SELECT idx
                                      FROM   groups
                                      WHERE
                         groupname = '${body.groupname}')),
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

  /**
   * modify old event
   * @param {string} body.groupname - the name of the group under which event took place.
   * @param {string} body.oldeventname - the name of the event.
   * @param {string} body.neweventname - the newly proposed name of the event.
   * @param {string} body.olddate - the date of the event.
   * @param {string} body.newdate - the newly proposed date of the event.
   * @param {object} body.oldrecipient - details of the recipient of the event.
   * @param {object} body.newrecipient - details of the newly proposed recipient of the event.
   * @return {error} err - return err if error, nothing if successful
   */
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

  updateParticipantsCost: (body) => {
    let updateParticipantsCostQuery = '';
    body.participants.forEach((participant) => {
      updateParticipantsCostQuery += `
      UPDATE eventmember SET cost=${participant.cost}
      where  user_idx = (SELECT idx
                        FROM   user
                        WHERE  email = '${participant.email}')
      AND    event_idx = (SELECT idx
                          FROM   event
                          WHERE  eventname = '${body.neweventname}'
                                 AND date = '${body.newdate}'
                                 AND group_idx = (SELECT idx
                                                  FROM   groups
                                                  WHERE  groupname = '${body.groupname}'))
      ;`;
    });
    console.log(updateParticipantsCostQuery);
    return new Promise((resolve, reject) => {
      connection.query(updateParticipantsCostQuery, (err) => {
        if (err) return reject(err);
        return resolve();
      });
    });
  },
  /**
   * add new participants to the existing event
   * @param {string} body.groupname - the name of the group under which event took place.
   * @param {string} body.neweventname - the name of the event.
   * @param {string} body.newdate - the date of the event.
   * @param {array} body.participants - the list of the details about the participants.
   * @return {error} err - return err if error, nothing if successful
   */
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

  /**
   * add new participants to the existing event
   * @param {string} body.groupname - the name of the group under which event took place.
   * @param {string} body.neweventname - the name of the event.
   * @param {string} body.newdate - the date of the event.
   * @param {array} body.dropped - the list of the details about the participants to be deleted.
   * @return {error} err - return err if error, nothing if successful
   */
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
    return new Promise((resolve, reject) => {
      connection.query(updateEventDropParticipantsQuery, (err) => {
        if (err) return reject(err);
        return resolve();
      });
    });
  },
};
