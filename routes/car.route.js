const express = require('express');
const router = express.Router();

const { storeCarDetail } = require('../controller/car-controller');
const { verifyAccessToken } = require('../utils/jwt-helper');

router.post('/', verifyAccessToken, storeCarDetail);

module.exports = router;