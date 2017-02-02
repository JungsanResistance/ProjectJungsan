const express = require('express');

const model = require('../model/index');

module.exports = {
  mainPage: {
    get: (req, res) => {
      return model.mainPage.get(req)
      .then(result => {
        const body = JSON.stringify(result);
        console.log(body);
        res.json(body);
      });
    }
  },
  transaction: {
    get: (req, res) => {
      return model.transaction.get(req)
      .then(result => {
        const body = JSON.stringify(result);
        console.log(body);
        res.json(body);
      });
    },
  },
};
