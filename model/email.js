const ses = require('node-ses');

const client = ses.createClient({ key: 'key', secret: 'secret' });

module.exports = (from, to, type) => {
  console.log('email working?', to);
  const admin = 'jungsan.project@gmail.com';
  const sendData = {
    to,
    from: admin,
    cc: from.email,
    subject: `${from.username}님으로부터 정산 요청이 도착하였습니다`,
    message: `<p><b>${from.username}</b>님께서 정산 확인을 요청하였습니다!</p>
            <p><a href="http://ec2-52-78-111-241.ap-northeast-2.compute.amazonaws.com:3000">프로젝트 정산 홈페이지</a>에서 내역을 확인하신 후, 정산 수락 혹은 거절을 선택해주세요.</p>
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
            <p><a href="http://ec2-52-78-111-241.ap-northeast-2.compute.amazonaws.com:3000">프로젝트 정산 홈페이지</a>에서 내역을 확인해주세요.</p>
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
            <p><a href="http://ec2-52-78-111-241.ap-northeast-2.compute.amazonaws.com:3000">프로젝트 정산 홈페이지</a>
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
      console.log('email working?3')
      resolve(res);
    });
  });
};
