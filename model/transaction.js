const transaction = require('../db/transaction');

module.exports = {
  get: (req) => {
    console.log('hi');
    const currentUser = req.session.passport.user;
    const query = req.query;
    console.log(query);
    if (query.type === 'post') {
      return new Promise((resolve, reject) => (resolve()))
      .then(() => (
        transaction.getGroupList(currentUser)
      ))
      .then((groupList) => {
        console.log(groupList);
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
  post: req => (transaction.postTransaction(req.body)),
  put: (req) => {
    return new Promise((resolve, reject) => (resolve()))
    .then(() => (
      transaction.updateEventDetail(req.body)
    ))
    .then(() => {
      console.log('updateEventDetail');
      return new Promise((resolve, reject) => {
        resolve(transaction.updateEventAddParticipants(req.body));
      });
    })
    .then(() => {
            console.log('updateEventAddParticipants');
      return new Promise((resolve, reject) => {
        resolve(transaction.getParticipantsDetail(req.body.groupname, req.body.neweventname, req.body.newdate));
      });
    })
    .then((participantsDetail) => {
            console.log('updateDrop');
      let JSONparticipantsDetail = JSON.stringify(participantsDetail);
      JSONparticipantsDetail = JSON.parse(JSONparticipantsDetail);
      req.body.dropped = [];
      JSONparticipantsDetail.forEach((oldparticipant) => {
        req.body.dropped.push(oldparticipant.email);
      });
      req.body.participants.forEach((newparticipant) => {
        req.body.dropped.splice((req.body.dropped.indexOf(newparticipant.email)), 1);
      });
      console.log(JSONparticipantsDetail);
            console.log(req.body.participants);
      if (req.body.dropped.length) {
        return new Promise((resolve, reject) => {
          resolve(transaction.updateEventDropParticipants(req.body));
        });
      }
    })
    .catch(err => Promise.reject(err));
  },
};
