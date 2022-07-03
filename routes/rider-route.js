const express = require('express');
const router = express.Router();
const riderController = require('../controller/rider-add-controller');
const {verifyAccessToken} = require('../utils/jwt-helper');

router.get('/', verifyAccessToken, riderController.showAdRide);
router.post('/', verifyAccessToken, riderController.adRide);

module.exports = router;