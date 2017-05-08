const mysql = require('mysql');
const keys = require('../keys/keys');

const connection = mysql.createConnection(keys.AWSdb);


module.exports = {
  /**
   * check whether the user by the same id exists in the db
   * @param {string} id - the id returned by authorization server(google, facebook)
   * @return {array} result - !length if does not exist, length if exists
   */
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

  /**
   * check whether the user by the same email exists in the db
   * @param {string} id - the id returned by authorization server(google, facebook)
   * @return {array} result - !length if does not exist, length if exists
   */
  checkDuplicateEmail: (email) => {
    const checkDuplicateEmailQuery =
    `Select * from user where email = '${email}';`;
    return new Promise((resolve, reject) => {
      connection.query(checkDuplicateEmailQuery, (err, result) => {
        if (err) return reject(err);
        return resolve(result);
      });
    });
  },

  /**
   * register the user in the db
   * @param {string} id - the id returned by authorization server(google, facebook)
   * @param {string} name - the name returned by authorization server(google, facebook)
   * @param {string} email - the email returned by authorization server(google, facebook)
   * @return {error} err - return err if error occurs, nothing if successful
   */
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
