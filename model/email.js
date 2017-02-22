const ses = require('node-ses');
const keys = require('../keys/keys');

const client = ses.createClient({ key: keys.AWSAccess.key, secret: keys.AWSAccess.secret });

module.exports = {
  transaction: (from, to, type) => {
    console.log('email working?', to);
    const admin = 'oneovern.com@gmail.com';
    const sendData = {
      to,
      from: admin,
      cc: from.email,
      subject: `${from.username}님으로부터 정산 요청이 도착하였습니다`,
      message: `<p><b>${from.username}</b>님께서 정산 확인을 요청하였습니다!</p>
              <p><a href="http://oneovern.com/">프로젝트 정산 홈페이지</a>에서 내역을 확인하신 후, 정산 수락 혹은 거절을 선택해주세요.</p>
              <p>저희 서비스를 이용해주셔서 감사합니다.</p>
              <br>
              <br>
              <p>프로젝트 정산 관리자 드림</p>
              <br>
              <br>
              <footer>해당 메일은 발신전용으로, 답신이 불가함을 알려드립니다.</footer>
      `,
    };
    if (type === 'accept') {
      sendData.subject = `${from.username}님께서 정산 요청을 수락하였습니다`;
      sendData.message = `<p><b>${from.username}</b>님께서 정산 요청을 수락하였습니다!</p>
              <p><a href="http://oneovern.com/">프로젝트 정산 홈페이지</a>에서 내역을 확인해주세요.</p>
              <p>저희 서비스를 이용해주셔서 감사합니다.</p>
              <br>
              <br>
              <p>프로젝트 정산 관리자 드림</p>
              <br>
              <br>
              <footer>해당 메일은 발신전용으로, 답신이 불가함을 알려드립니다.</footer>
      `;
    }
    if (type === 'reject') {
      sendData.subject = `${from.username}님께서 정산 요청을 거절하였습니다`;
      sendData.message = `<p><b>${from.username}</b>님께서 정산 요청을 거절하였습니다.</p>
              <p><a href="http://oneovern.com/">프로젝트 정산 홈페이지</a>
              에서 내역을 확인하실 수 있으며 추후에 다시 정산을 요청하실 수 있습니다.</p>
              <p>저희 서비스를 이용해주셔서 감사합니다.</p>
              <br>
              <br>
              <p>프로젝트 정산 관리자 드림</p>
              <br>
              <br>
              <footer>해당 메일은 발신전용으로, 답신이 불가함을 알려드립니다.</footer>
      `;
    }
    return new Promise((resolve, reject) => {
      console.log('email working?2')
      client.sendEmail(sendData, (err, data, res) => {
        if (err) return reject(err);
        resolve(res);
      });
    });
  },
  duplicate: (profile) => {
    const admin = 'oneovern.com@gmail.com';
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
              <p><a href="http://oneovern.com/auth/${source}">여기를 클릭</a>하셔서 해당 계정으로 로그인해주세요.</p>
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
      console.log('email working?2')
      client.sendEmail(sendData, (err, data, res) => {
        if (err) return reject(err);
        console.log('email working?3')
        resolve(res);
      });
    });
  },
  events: (eventDetail, type) => {
    const admin = 'oneovern.com@gmail.com';
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
              <p><a href="http://oneovern.com/">프로젝트 정산 홈페이지</a>
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
        console.log('email working?3')
        resolve(res);
      });
    });
  },
}
