const express = require('express');
const app = express();
const env = require('dotenv/config');
const mongoose = require('mongoose');
const createError = require('http-errors');
const apiRoutes = require('./routes');
const { sendErrorResponse } = require('./utils/response');
const config = require('./config/config');
const fileUpload = require('express-fileupload');
const path = require('path');

require('dotenv/config');
main().catch(err => console.log(err));

async function main() {
  await mongoose
    .connect(config.dbConfig.databaseUrl)
    .then(() => {
      console.log("Mongodb connected");
    })
    .catch((error) => {
      console.log({ error_database_connection: error.message });
    });
}

app.use(fileUpload({
  //useTempFiles:true,
  //tempFileDir: path.join(__dirname,'temp'),
  createParentPath:true,
  //limits:{fileSize:1024}
}));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get('/',async (req, res)=>{
	res.send("ride share applicaton");
});

app.use('/api',apiRoutes);

app.use(async (req, res, next)=>{
  next(createError.NotFound('this route does not exist'));
});

app.use((err, req, res, next)=>{
  const statusCode = err.status || 500;
  res.status(statusCode);
  return sendErrorResponse(res,err.message,statusCode);
});

const PORT = config.PORT || 3000;

app.listen(PORT,() => console.log(`Server running on port ${PORT}`));