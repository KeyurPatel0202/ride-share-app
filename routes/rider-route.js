const express = require('express');
const router = express.Router();
const riderController = require('../controller/rider-controller');
const {verifyAccessToken} = require('../utils/jwt-helper');

router.post('/', verifyAccessToken, riderController.adRide);
router.get('/', verifyAccessToken, riderController.showAdRide);
router.post('/request-action',verifyAccessToken,riderController.riderRequestAction);
router.delete('/:id', verifyAccessToken, riderController.deleteAdRide);

module.exports = router;