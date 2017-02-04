const model = require('../model/index');

module.exports = {
  mainPage: {
    get: (req, res) => (model.mainPage.get(req))
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
      const body = JSON.parse(req.body);
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
  history: {
    get: (req, res) => (model.history.get(req))
    .then((result) => {
      const body = JSON.stringify(result);
      console.log(body);
      res.json(body);
    }),
  },
};
