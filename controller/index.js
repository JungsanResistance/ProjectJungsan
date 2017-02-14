const groupedit = require('../model/groupedit');
const history = require('../model/history');
const mypage = require('../model/mypage');
const misc = require('../model/misc');
const transaction = require('../model/transaction');

module.exports = {
  landing: {
    get: (req, res) => {
      res.sendStatus(200);
    },
  },
  myPage: {
    get: (req, res) => (mypage.get(req))
    .then((result) => {
      const body = JSON.stringify(result);
      console.log(body);
      res.json(body);
    })
    .catch((err) => {
      res.sendStatus(400);
    }),
  },
  transaction: {
    get: (req, res) => (transaction.get(req))
    .then((result) => {
      const body = JSON.stringify(result);
      console.log(body);
      res.json(body);
    }),
    post: (req, res) => (transaction.post(req))
      .then(() => {
        res.sendStatus(201);
      })
      .catch((err) => {
        res.sendStatus(406);
        throw err;
      }),
    put: (req, res) => (transaction.put(req))
    .then(() => {
      res.sendStatus(200);
    })
    .catch((err) => {
      console.log('error', err)
      res.sendStatus(406);
    }),
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
      res.sendStatus(201);
    })
    .catch((err) => {
      res.sendStatus(406);
      throw err;
    }),
    put: (req, res) => (groupedit.put(req))
    .then(() => {
      res.sendStatus(200);
    })
    .catch((err) => {
      res.sendStatus(406);
      throw err;
    }),
  },
  history: {
    get: (req, res) => (history.get(req))
    .then((result) => {
      const body = JSON.stringify(result);
      console.log(body);
      res.json(body);
    })
    .catch((err) => {
      res.sendStatus(400);
      throw err;
    }),
    put: (req, res) => (history.put(req))
    .then(() => {
      res.sendStatus(200);
    })
    .catch((err) => {
      res.sendStatus(406);
      throw err;
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
      res.sendStatus(200);
    })
    .catch((err) => {
      console.log('error', err)
      res.sendStatus(406);
    }),
  },
};
