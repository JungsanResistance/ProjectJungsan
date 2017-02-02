const express = require('express');

const router = express.Router();
const controller = require('../controller/index');

/* GET home page. */
router.get('/', controller.mainPage.get);
router.get('/transaction/', controller.transaction.get);


module.exports = router;
