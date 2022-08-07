const express = require('express');
const router = express.Router();

const rateController = require('../controller/rate-controller');
const { verifyAccessToken } = require('../utils/jwt-helper');

router.post('/', verifyAccessToken, rateController.addRating);
router.delete('/:id', verifyAccessToken, rateController.deleteRating);
router.get('/:id', verifyAccessToken, rateController.getRate);
router.post('/:id', verifyAccessToken, rateController.updateRate);

module.exports = router;