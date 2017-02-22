const transaction = require('../db/transaction');
const auth = require('../db/auth');

module.exports = {
  get: (req) => {
    const currentUser = req.session.passport.user;
    const query = req.query;
    console.log(query);
    if (query.type === 'post') {
      return new Promise((resolve, reject) => (resolve()))
      .then(() => (
        transaction.getGroupList(currentUser)
      ))
      .then((groupList) => {
        console.log('grouplist',groupList);
        const body = JSON.stringify(groupList);
        const jsonBody = JSON.parse(body);
        return transaction.getGroupMember(jsonBody);
      })
      .catch(err => Promise.reject(err));
    } else if (query.type === 'put'){
      console.log(query.groupname, query.eventname, query.date)
      const result = {}
      return new Promise((resolve, reject) => (resolve()))
      .then(() => {
        return new Promise((resolve, reject) => {
          resolve(transaction.getEventDetail(query.groupname,query.eventname, query.date))
        });
      })
      .then((eventDetail) => {
        let JSONeventDetail = JSON.stringify(eventDetail);
        JSONeventDetail = JSON.parse(JSONeventDetail);
        result.date = JSONeventDetail[0].date;
        result.groupname = JSONeventDetail[0].groupname;
        result.eventname = JSONeventDetail[0].eventname;
        return new Promise((resolve, reject) => {
          resolve(transaction.getParticipantsDetail(query.groupname, query.eventname, query.date));
        });
      })
      .then((participantsDetail) => {
        let JSONparticipantsDetail = JSON.stringify(participantsDetail);
        JSONparticipantsDetail = JSON.parse(JSONparticipantsDetail);
        result.participants = JSONparticipantsDetail;
        return new Promise((resolve, reject) => {
          resolve(transaction.getRecipientDetail(query.groupname, query.eventname, query.date));
        });
      })
      .then((recipientDetail) => {
        let JSONrecipientDetail = JSON.stringify(recipientDetail);
        JSONrecipientDetail = JSON.parse(JSONrecipientDetail);
        result.oldrecipient = JSONrecipientDetail[0];
        result.newrecipient = JSONrecipientDetail[0];
        return result;
      })
      .catch(err => Promise.reject(err));
    } else if (query.type === 'check'){
      console.log(query.groupname, query.eventname, query.date)
      return new Promise((resolve, reject) => (resolve()))
      .then(() => {
        return new Promise((resolve, reject) => {
          resolve(transaction.getEventDetail(query.groupname, query.eventname, query.date))
        });
      })
      .catch(err => Promise.reject(err));
    }
  },
  post: (req) => {
    const body = req.body;
    body.userid = req.session.passport.user;
    const stringifiedParticipants = JSON.stringify(body.participants);
    const stringifiedRecipient = JSON.stringify(body.newrecipient);
    const checkRecipientInParticipant = stringifiedParticipants.includes(stringifiedRecipient);
    console.log(stringifiedRecipient, stringifiedParticipants);
    console.log(req.body.newrecipient, checkRecipientInParticipant);
    if (!checkRecipientInParticipant) {
      return Promise.reject('Recipient is not a participant');
    }
    return transaction.getEventDetail(body.groupname, body.eventname, body.date)
    .then((isDuplicate) => {
      if (isDuplicate.length) return Promise.reject('Is a duplicate');
      else return auth.checkGroupMember(body.userid, body.groupname)
    })
    .then((isMember) => {
      if (!isMember.length) return Promise.reject('Not a group member');
      else return auth.checkGroupAdmin(body.userid, body.groupname);
    })
    // prevent adding duplicate admin if post creator === group admin
    .then((isAdmin) => {
      if (isAdmin.length) {
        body.isadmin = true;
      } else {
        body.isadmin = false;
      }
      return transaction.postTransaction(body);
    })
    // return event detail when successful for sending emails
    .then(() => body)
    .catch(err => Promise.reject(err));
  },
  put: (req) => {
    const body = req.body;
    body.userid = req.session.passport.user;
    const stringifiedParticipants = JSON.stringify(body.participants);
    const stringifiedRecipient = JSON.stringify(body.newrecipient);
    const checkRecipientInParticipant = stringifiedParticipants.includes(stringifiedRecipient);
    if (!checkRecipientInParticipant) {
      return Promise.reject('Recipient is not a participant');
    }
    return auth.checkEventAdmin(body.userid, body.groupname,
      body.oldeventname, body.olddate)
    .then((isAdmin) => {
      if (!isAdmin.length) return Promise.reject('Not the admin');
    })
    .then(() => (
      transaction.updateEventDetail(body)
    ))
    .then(() => {
      console.log('updateEventDetail');
      return new Promise((resolve, reject) => {
        resolve(transaction.updateEventAddParticipants(body));
      });
    })
    .then(() => {
            console.log('updateEventAddParticipants');
      return new Promise((resolve, reject) => {
        resolve(transaction.getParticipantsDetail(body.groupname, body.neweventname, body.newdate));
      });
    })
    .then((participantsDetail) => {
            console.log('updateDrop');
      let JSONparticipantsDetail = JSON.stringify(participantsDetail);
      JSONparticipantsDetail = JSON.parse(JSONparticipantsDetail);
      body.dropped = [];
      JSONparticipantsDetail.forEach((oldparticipant) => {
        body.dropped.push(oldparticipant.email);
      });
      body.participants.forEach((newparticipant) => {
        body.dropped.splice((body.dropped.indexOf(newparticipant.email)), 1);
      });
      console.log(JSONparticipantsDetail);
            console.log(body.participants);
      if (body.dropped.length) {
        return new Promise((resolve, reject) => {
          resolve(transaction.updateEventDropParticipants(body));
        });
      }
    })
    // return event detail when successful for sending emails
    .then(() => body)
    .catch(err => Promise.reject(err));
  },
};
