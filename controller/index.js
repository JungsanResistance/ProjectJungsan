const groupedit = require('../model/groupedit');
const history = require('../model/history');
const mypage = require('../model/mypage');
const misc = require('../model/misc');
const transaction = require('../model/transaction');

module.exports = {
  landing: {
    get: (req, res) => {
      res.writeHead(200);
      res.end();
    },
  },
  myPage: {
    get: (req, res) => (mypage.get(req))
    .catch((err) => {
      res.writeHead(400);
      res.end();
    })
    .then((result) => {
      const body = JSON.stringify(result);
      console.log(body);
      res.json(body);
    }),
  },
  transaction: {
    get: (req, res) => (transaction.get(req))
    .then((result) => {
      const body = JSON.stringify(result);
      console.log(body);
      res.json(body);
    }),
    post: (req, res) => {
      const body = req.body;
      console.log(body);
      return transaction.post(body)
      .then(() => {
        res.writeHead(201);
        res.end();
      })
      .catch((err) => {
        res.writeHead(406);
        res.end();
        throw err;
      });
    },
  },
  group: {
    // add email to returned object
    get: (req, res) => (groupedit.get(req))
    .then((result) => {
      const body = JSON.stringify(result);
      console.log(body);
      res.json(body);
    }),
    post: (req, res) => (groupedit.post(req))
    .then(() => {
      res.writeHead(201);
      res.end();
    })
    .catch((err) => {
      res.writeHead(406);
      res.end();
      throw err;
    }),
    put: (req, res) => (groupedit.put(req))
    .then(() => {
      res.writeHead(200);
      res.end();
    })
    .catch((err) => {
      res.writeHead(406);
      res.end();
      throw err;
    }),
  },
  history: {
    get: (req, res) => (history.get(req))
    .then((result) => {
      const body = JSON.stringify(result);
      console.log(body);
      res.json(body);
    }),
    put: (req, res) => (history.put(req))
    .then(() => {
      res.writeHead(200);
      res.end();
    }),
  },
  misc: {
    get: (req, res) => (misc.get(req))
    .then((result) => {
      const body = JSON.stringify(result);
      console.log(body);
      res.json(body);
    }),
    put: (req, res) => (misc.put(req))
    .then(() => {
      res.writeHead(200);
      res.end();
    }),
  },
};
