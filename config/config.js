require('dotenv').config();

const dbConfig = { databaseUrl: process.env.DB_CONNECTION };
const PORT = process.env.PORT;

const jwtConfig = {
    accessToken: process.env.ACCESS_TOKEN_SECRET,
    refreshToken: process.env.REFRESH_TOKEN_SECRET,
  };

module.exports = { dbConfig, PORT, JWT: jwtConfig };