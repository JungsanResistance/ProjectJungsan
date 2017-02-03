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
