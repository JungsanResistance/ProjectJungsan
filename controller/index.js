const model = require('../model/index');
const path = require('path')

module.exports = {
  landing: {
    get: (req, res) => {
      res.writeHead(200);
      res.end();
    },
  },
  mainPage: {
    get: (req, res) => (model.mainPage.get(req))
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
    get: (req, res) => (model.transaction.get(req))
    .then((result) => {
      const body = JSON.stringify(result);
      console.log(body);
      res.json(body);
    }),
    post: (req, res) => {
      const body = req.body;
      console.log(body);
      return model.transaction.post(body)
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
  groupedit: {
    // add email to returned object
    get: (req, res) => (model.groupedit.get(req))
    .then((result) => {
      const body = JSON.stringify(result);
      console.log(body);
      res.json(body);
    }),
    post: (req, res) => (model.groupedit.post(req))
    .then(() => {
      res.writeHead(201);
      res.end();
    })
    .catch((err) => {
      res.writeHead(406);
      res.end();
      throw err;
    }),
    put: (req, res) => (model.groupedit.put(req))
    .then(() => {
      res.writeHead(201);
      res.end();
    })
    .catch((err) => {
      res.writeHead(406);
      res.end();
      throw err;
    }),
  },
  history: {
    get: (req, res) => (model.history.get(req))
    .then((result) => {
      const body = JSON.stringify(result);
      console.log(body);
      res.json(body);
    }),
    put: (req, res) => (model.history.put(req))
    .then(() => {
      res.writeHead(201);
      res.end();
    }),
  },
  total: {
    put: (req, res) => (model.total.put(req))
    .then(() => {
      res.writeHead(201);
      res.end();
    }),
  },
};
