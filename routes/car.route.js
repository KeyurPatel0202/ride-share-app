const express = require('express');
const router = express.Router();

const carController = require('../controller/car-controller');
const { verifyAccessToken } = require('../utils/jwt-helper');

router.post('/', verifyAccessToken, carController.storeCarDetail);
router.get('/', verifyAccessToken, carController.carList);
router.post('/:id', verifyAccessToken, carController.carUpdate);
router.delete('/:id', verifyAccessToken, carController.carDelete);
router.delete('/delete/images',verifyAccessToken, carController.deleteCarImages);

module.exports = router;