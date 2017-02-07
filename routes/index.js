const express = require('express');

const router = express.Router();
const controller = require('../controller/index');

/* GET home page. */
router.route('/')
.get(controller.landing.get);

// router.route('/group/post')
// .get(controller.groupPost.get)
// .post();

router.route('/mypage')
.get(controller.mainPage.get);

router.route('/transaction')
.get(controller.transaction.get)
.post(controller.transaction.post);

router.route('/history')
.get(controller.history.get);

module.exports = router;
