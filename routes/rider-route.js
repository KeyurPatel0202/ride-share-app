const express = require('express');
const router = express.Router();
const riderController = require('../controller/rider-controller');
const {verifyAccessToken} = require('../utils/jwt-helper');

router.post('/', verifyAccessToken, riderController.adRide);
router.get('/', verifyAccessToken, riderController.showAdRide);

module.exports = router;