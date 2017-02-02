const mysql = require('mysql');
const connection = mysql.createConnection({
  host     : 'projectjungsan.ctkksl4fom4l.ap-northeast-2.rds.amazonaws.com',
  port     : 3306,
  user     : 'admin',
  password : 'MKkm3hx9',
  database : 'Jungsan_DB'
});

module.exports = {
  getTotalSum: (userid) => {
    //userId는 cs5로 테스팅
    const getTotalSumQuery = `
    SELECT username,
           cost
    FROM (
           (SELECT sum(em.cost) AS cost,
                   e.recipient_idx AS user_idx
            FROM eventmember em,
                 event e
            WHERE em.event_idx = e.idx
              AND em.user_idx =
                (SELECT idx
                 FROM user
                 WHERE userid = "${userid}")
              AND em.ispaid=FALSE
            GROUP BY e.recipient_idx)
         UNION ALL
           (SELECT -sum(em.cost) AS cost,
                    em.user_idx AS user_idx
            FROM eventmember em,
                 event e
            WHERE em.event_idx = e.idx
              AND e.recipient_idx =
                (SELECT idx
                 FROM user
                 WHERE userid = "${userid}")
              AND em.ispaid=FALSE
            GROUP BY em.user_idx)) AS Z
            LEFT JOIN user u ON u.idx=Z.user_idx
    GROUP BY Z.user_idx;`;

    return new Promise((resolve, reject) => {
      connection.query(getTotalSumQuery, (err) => {
        if (err) return reject(err);
        return resolve();
      });
    });
  }
};
