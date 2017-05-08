const ses = require('node-ses');
const keys = require('../keys/keys');

const client = ses.createClient({ key: keys.AWSAccess.key, secret: keys.AWSAccess.secret });

module.exports = {

  /**
   * automatically send email for newly confirmed/pending transaction
   * @param {string} to - the email of the subject of the event.
   * @param {string} from - the detail of the requestor.
   * @param {string} type - the context of the email.
   * @return {error} err - return err if error, nothing if successful
   */
  transaction: (from, to, type) => {
    const admin = 'projectJungsan@gmail.com';
    let responseType = '정산 요청이 도착';
    if (type === 'accept') {
      responseType = '정산 요청을 수락';
    } else if (type === 'reject') {
      responseType = '정산 요청을 거절';
    }
    const sendData = {
      to,
      from: admin,
      cc: from.email,
      subject: `${from.username}님으로부터 ${responseType}하였습니다`,
      message: `<p><b>${from.username}</b>님께서 정산 확인을 요청하였습니다!</p>
              <p><a href="http://ec2-13-124-106-58.ap-northeast-2.compute.amazonaws.com:3000">프로젝트 정산 홈페이지</a>에서 내역을 확인하신 후, 정산 수락 혹은 거절을 선택해주세요.</p>
              <p>저희 서비스를 이용해주셔서 감사합니다.</p>
              <br>
              <br>
              <p>프로젝트 정산 관리자 드림</p>
              <br>
              <br>
              <footer>해당 메일은 발신전용으로, 답신이 불가함을 알려드립니다.</footer>
      `,
    };
    return new Promise((resolve, reject) => {
      client.sendEmail(sendData, (err, data, res) => {
        if (err) return reject(err);
        resolve(res);
      });
    });
  },

  /**
   * notifies the user about the existence of an account in case of the trial to create duplicate account
   * @param {string} profile - the profile returned from the authorization server (google, facebook).
   * @return {error} err - return err if error, nothing if successful
   */
  duplicate: (profile) => {
    const admin = 'projectJungsan@gmail.com';
    const id = profile.userid;
    const name = profile.username;
    const email = profile.email;
    let source = 'google';
    if (id.length === 32) {
      source = 'facebook';
    }
    const sendData = {
      to: email,
      from: admin,
      subject: `${name} 님, 이미 등록된 계정이 확인되었습니다`,
      message: `
              <p>안녕하세요, <b>${name}</b>님!</p>
              <p>고객님의 <b>${source}</b> 계정의 메일 주소로 지정된  <b>${email}</b> 의 이메일로 생성된 계정이 있음이 확인되었습니다.</p>
              <p><a href="http://ec2-13-124-106-58.ap-northeast-2.compute.amazonaws.com:3000">여기를 클릭</a>하셔서 해당 계정으로 로그인해주세요.</p>
              <p>저희 서비스를 이용해주셔서 감사합니다.</p>
              <br>
              <br>
              <p>프로젝트 정산 관리자 드림</p>
              <br>
              <br>
              <footer>해당 메일은 발신전용으로, 답신이 불가함을 알려드립니다.</footer>
      `,
    };
    return new Promise((resolve, reject) => {
      client.sendEmail(sendData, (err, data, res) => {
        if (err) return reject(err);
        resolve(res);
      });
    });
  },

  /**
   * automatically send email for new addtion / editing of the event in which the user participated in
   * @param {object} eventDetail - full detail of the event (event name, group name, date, recipient, participant).
   * @param {string} type - the context of the email.
   * @return {error} err - return err if error, nothing if successful
   */
  events: (eventDetail, type) => {
    const admin = 'projectJungsan@gmail.com';
    const participantsemails = [];
    let participants = '';
    let eventtype = '생성';
    if (type === 'put') {
      eventtype = '변경';
    }
    eventDetail.participants.forEach((participant) => {
      participants += ` ${participant.username}(${participant.cost}),`;
      if (participant.email !== eventDetail.newrecipient.email){
        participantsemails.push(participant.email);
      }
    });
    console.log(participantsemails);
    participants = participants.slice(0, participants.length - 1);
    const recipientemail = eventDetail.newrecipient.email;
    const sendData = {
      to: recipientemail,
      from: admin,
      cc: participantsemails,
      subject: `고객님이 포함된 이벤트가 ${eventtype}되었습니다`,
      message: `
              <p>고객님이 포함된 이벤트가 ${eventtype}되었습니다.</p>
              <p>내역은 다음과 같습니다:</p>
              <br>
              <p>그룹명: ${eventDetail.groupname}</p>
              <p>일시: ${eventDetail.date}</p>
              <p>이벤트명: ${eventDetail.eventname}</p>
              <p>정산자: ${eventDetail.newrecipient.username}</p>
              <p>참여자:${participants}</p>
              <br>
              <p><a href="http://ec2-13-124-106-58.ap-northeast-2.compute.amazonaws.com:3000">프로젝트 정산 홈페이지</a>
              에서 내역을 확인하실 수 있으며</p>
              <p>잘못 기입된 사항이 있을 경우 그룹 관리자 혹은 이벤트 생성자에게 문의하시기 바랍니다.</p>
              <p>저희 서비스를 이용해주셔서 감사합니다.</p>
              <br>
              <br>
              <p>프로젝트 정산 관리자 드림</p>
              <br>
              <br>
              <footer>해당 메일은 발신전용으로, 답신이 불가함을 알려드립니다.</footer>
      `,
    };
    return new Promise((resolve, reject) => {
      client.sendEmail(sendData, (err, data, res) => {
        if (err) return reject(err);
        resolve(res);
      });
    });
  },
}
