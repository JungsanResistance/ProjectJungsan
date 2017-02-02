var express = require('express');
var router = express.Router();
const controller = require('../controller/index');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send(controller.mainPage.get(req));
});

module.exports = router;
