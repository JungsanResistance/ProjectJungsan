const express = require('express');

const model = require('../model/index');

module.exports = {
  mainPage: {
    get: (req, res) => {
      return model.mainPage.get(req)
      .then(res => {
        const body = JSON.stringify(res);
        console.log(body);
      });
    }
  },
};
