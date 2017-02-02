const mysql = require('mysql');
const connection = mysql.createConnection({
  host     : 'projectjungsan.ctkksl4fom4l.ap-northeast-2.rds.amazonaws.com',
  port     : 3306,
  user     : 'admin',
  password : 'MKkm3hx9',
  database : 'Jungsan_DB'
});

module.exports = {
  getTotalSum: (userId) => {
    //userId는 cs5로 테스팅
    const getTotalSumQuery = `select u.username, SUM(em.cost) FROM eventmember em INNER JOIN user u ON u.idx=em.event_recipient_idx where (em.user_idx=(select u.idx from user u where u.userid='${userid}') AND em.ispaid=FALSE) GROUP BY em.event_recipient_idx;`;

    return new Promise((resolve, reject) => {
      connection.query(getTotalSumQuery, (err) => {
        if (err) return reject(err);
        return resolve();
      });
    });
  }
};
