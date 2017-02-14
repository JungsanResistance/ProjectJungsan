const express = require('express');

const router = express.Router();
const controller = require('../controller/index');

/* GET home page. */
router.route('/signin')
.get(controller.landing.get);

router.route('/group*')
.get(controller.group.get)
.post(controller.group.post)
.put(controller.group.put);

router.route('/mypage')
.get(controller.myPage.get);

router.route('/transaction*')
.get(controller.transaction.get)
.post(controller.transaction.post)
.put(controller.transaction.put);

router.route('/history')
.get(controller.history.get)
.put(controller.history.put);

router.route('/misc')
.get(controller.misc.get)
.put(controller.misc.put);


module.exports = router;
