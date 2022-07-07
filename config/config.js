require('dotenv').config();

const dbConfig = { databaseUrl: process.env.DB_CONNECTION };
const PORT = process.env.PORT;

const jwtConfig = {
    accessToken: process.env.ACCESS_TOKEN_SECRET,
    refreshToken: process.env.REFRESH_TOKEN_SECRET,
};

const mailer ={
  user: process.env.USER,
  pass: process.env.PASSWORD,
};

module.exports = { dbConfig, mailer, PORT, JWT: jwtConfig };