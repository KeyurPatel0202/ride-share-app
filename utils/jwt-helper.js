const JWT = require('jsonwebtoken');
const createError = require('http-errors');
const config = require('../config/config')['JWT'];

module.exports = {
  signAccessToken: (user_id) => {
    //creting a token here
    return new Promise((resolve, reject) => {
      const payload = {};
      const secret = config.accessToken;
      const options = {
        expiresIn: '10000s',
        //issuer: "www.example.com",
        audience: user_id.toString(),
      };
      JWT.sign(payload, secret, options, (err, token) => {
        //if (err) reject(err);
        if (err) {
          reject(createError.InternalServerError());
        }
        resolve(token);
      });
    });
  },

  verifyAccessToken: (req, res, next) => {
    if (!req.headers['authorization']) return next(createError.Unauthorized());
    const authHeader = req.headers['authorization'];
    const bearerToken = authHeader.split(' ');
    const token = bearerToken[1];

    JWT.verify(token, config.accessToken, (err, payload) => {
      if (err) {
        return next(createError.Unauthorized());
      }
      req.payload = payload;
      next();
    });
  },

  signRefreshToken: (user_id) => {
    //creting a token here
    return new Promise((resolve, reject) => {
      const payload = {};
      const secret = config.refreshToken;
      const options = {
        expiresIn: '1y', //1 year
        //issuer: "www.example.com",
        audience: user_id,
      };

      JWT.sign(payload, secret, options, (err, token) => {
        //if (err) reject(err);
        if (err) {
          reject(createError.InternalServerError());
        }
        resolve(token);
      });
    });
  },

  verifyRefreshToken: (refreshToken) => {
    return new Promise((resolve, reject) => {
      JWT.verify(refreshToken, config.refreshToken, (err, payload) => {
        if (err) return reject(createError.Unauthorized());
        const userId = payload.aud;

        resolve(userId);
      });
    });
  },
};
