const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'projectjungsan.ctkksl4fom4l.ap-northeast-2.rds.amazonaws.com',
  port: 3306,
  user: 'admin',
  password: 'MKkm3hx9',
  database: 'Jungsan_DB',
  multipleStatements: true,
});

module.exports = {
  findAuthUserById: (id) => {
    const findAuthUserByIdQuery =
    `Select * from user where userid = ${id};`;
    return new Promise((resolve, reject) => {
      connection.query(findAuthUserByIdQuery, (err, result) => {
        if (err) return reject(err);
        return resolve(result);
      });
    });
  },
  createNewUser: (id, name, email) => {
    const createNewUserQuery =
    `INSERT INTO user (userid, username, email) VALUES ('${id}', '${name}', '${email}');`;
    return new Promise((resolve, reject) => {
      connection.query(createNewUserQuery, (err) => {
        if (err) return reject(err);
        return resolve();
      });
    });
  },
};
