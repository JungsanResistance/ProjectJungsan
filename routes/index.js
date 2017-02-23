const express = require('express');


const router = express.Router();
const controller = require('../controller/index');

/**
 * router to prevent unauthorized access to api (and redirect)
 * @param {Object} http request
 * @param {Object} http response
 */
router.use((req, res, next) => {
  if (!req.session.passport) {
    res.redirect('/');
  } else {
    return next();
  }
});

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

router.route('/history*')
.get(controller.history.get)
.put(controller.history.put);

router.route('/misc')
.get(controller.misc.get)
.put(controller.misc.put);


module.exports = router;
