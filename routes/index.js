const express = require('express');

const router = express.Router();
const controller = require('../controller/index');

/* GET home page. */
router.route('/')
.get(controller.mainPage.get);

router.route('/transaction')
.get(controller.transaction.get)
.post(controller.transaction.post);

router.route('/history')
.get(controller.history.get);

module.exports = router;
