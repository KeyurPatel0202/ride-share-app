const express = require('express');
const app = express();
const authRoute = require('./auth.route');
const carRoute = require('./car.route');
const userRoute = require('./user.route');
const riderAdRoute = require('./rider-route');

app.use('/',authRoute);
app.use('/cars',carRoute);
app.use('/user', userRoute);
app.use('/rides',riderAdRoute);

module.exports = app;