const group = require('../model/group');
const history = require('../model/history');
const mypage = require('../model/mypage');
const misc = require('../model/misc');
const transaction = require('../model/transaction');
const email = require('../model/email');

module.exports = {
  landing: {
    get: (req, res) => {
      res.sendStatus(200);
    },
  },
  myPage: {
    get:
    (req, res) => (mypage.get(req))
    .then((result) => {
      const body = JSON.stringify(result);
      res.json(body);
    })
    .catch((err) => {
      res.sendStatus(400);
    }),
  },
  transaction: {
    get:
      (req, res) => (transaction.get(req))
      .then((result) => {
        const body = JSON.stringify(result);
        res.json(body);
      }),
    post:
      (req, res) => (transaction.post(req))
      .then((eventDetail) => {
        email.events(eventDetail, 'post');
        res.sendStatus(201);
      })
      .catch((err) => {
        if (err === 'Is a duplicate') {
          res.sendStatus(400);
          throw err;
        } else if (err === 'Recipient is not a participant') {
          res.sendStatus(400);
          throw err;
        } else if (err === 'Not a group member') {
          res.sendStatus(401);
          throw err;
        } else {
          res.sendStatus(406);
          throw err;
        }
      }
    ),
    put: (req, res) => (transaction.put(req))
    .then((eventDetail) => {
      email.events(eventDetail, 'put');
      res.sendStatus(200);
    })
    .catch((err) => {
      if (err === 'Recipient is not a participant') {
        res.sendStatus(400);
        throw err;
      }
      res.sendStatus(406);
    }),
  },
  group: {
    // add email to returned object
    get: (req, res) => (group.get(req))
    .then((result) => {
      const body = JSON.stringify(result);
      res.json(body);
    })
    .catch((err) => {
      if (err === 'Not a group member') {
        res.sendStatus(401);
        throw err;
      } else {
        res.sendStatus(406);
        throw err;
      }
    }),
    post: (req, res) => (group.post(req))
    .then(() => {
      res.sendStatus(201);
    })
    .catch((err) => {
      res.sendStatus(406);
      throw err;
    }),
    put: (req, res) => (group.put(req))
    .then(() => {
      res.sendStatus(200);
    })
    .catch((err) => {
      if (err === 'Not the admin') {
        res.sendStatus(401);
        throw err;
      } else {
        res.sendStatus(406);
        throw err;
      }
    }),
  },
  history: {
    get: (req, res) => (history.get(req))
    .then((result) => {
      const body = JSON.stringify(result);
      res.json(body);
    })
    .catch((err) => {
      res.sendStatus(406);
      throw err;
    }),
    put: (req, res) => (history.put(req))
    .then((currentUser) => {
      const action = req.body.action;
      email.transaction(currentUser[0], req.body.recipientemail, action);
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
      res.json(body);
    }),
    put: (req, res) => (misc.put(req))
    .then((currentUser) => {
      const action = req.body.action;
      email.transaction(currentUser[0], req.body.recipientemail, action);
      res.sendStatus(200);
    })
    .catch((err) => {
      if (err === 'Bad request') {
        res.sendStatus(400);
      } else {
        res.sendStatus(406);
      }
    }),
  },
};
