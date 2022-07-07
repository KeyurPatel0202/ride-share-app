const express = require('express');
const router = express.Router();
const userController = require('../controller/user-controller');
const {verifyAccessToken} = require('../utils/jwt-helper');

router.post('/request', verifyAccessToken, userController.storeUserRequest);
router.get('/request', verifyAccessToken, userController.getUserRequest);
router.post('/request', verifyAccessToken, userController.updateUserRequest);
router.post('/rating', verifyAccessToken, userController.SubmitRating);
router.post('/list', verifyAccessToken, userController.userList);
router.post('/update-status', verifyAccessToken, userController.updateStatus);

module.exports = router;