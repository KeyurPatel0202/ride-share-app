const express = require('express');
const router = express.Router();
const userAdController = require('../controller/user-ad-controller');
const {verifyAccessToken} = require('../utils/jwt-helper');

router.post('/', verifyAccessToken, userAdController.postRideRequest);
router.get('/', verifyAccessToken, userAdController.getAllRideRequest);
router.post('/:id', verifyAccessToken, userAdController.updateUserAd);
router.delete('/:id', verifyAccessToken, userAdController.deleteUserAd);

module.exports = router;