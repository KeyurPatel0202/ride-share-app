const User = require('../model/user.model');
const {sendSuccessResponse,sendErrorResponse} = require('../utils/response');
const bcrypt = require('bcrypt');
const createError = require("http-errors");
const getMessage = require('../utils/message');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt-helper');
const {fileCheckAndUpload} = require('../utils/file-upload');
const nodemailer = require('nodemailer');
const config = require('../config/config');
const {storeCar} = require('./car-controller');
const Car = require('../model/car.model');

const register = async (req, res)=>{		
	try{
		if(!req.files || !req.files.image){
			throw new Error(getMessage('PLEASE_SELECT_IMAGE'));
		}
		
		const {fname, lname, phone, gender, dob, address, country, state, city, zip_code, email, password, type, number, totalSeat} = req.body;
		const exist = await User.exists({email});
		
		if(exist) throw new Error(getMessage('EMAIL_ALREADY_REGISTERED'));

		const existCar = await Car.exists({number});
    
		if(existCar) throw new Error(getMessage('CAR_DETAIL_ALREADY_STORED'));

		if(type === 'RIDER'){
			if(!number || !totalSeat){
				throw new Error(getMessage('NUMBER_AND_TOAL_SEAT_REQUIRED'));
			}
			if(!req.files || !req.files.primaryImage){
				throw new Error(getMessage('PLEASE_SELECT_PRIMARY_CAR_IMAGE'));
			}
		}

		const image = await fileCheckAndUpload(req.files['image'], '../public/images');

		const reqData = {fname, lname, phone, gender, dob, address, country, state, city, zip_code, email, password, type, image}

		if(req.files.proof){
			const proof = await fileCheckAndUpload(req.files['proof'], '../public/proof', /jpg|jpeg|png|pdf/);
			reqData.proof = proof;
		}

		if(req.files.study_permit){
			const study_permit = await fileCheckAndUpload(req.files['study_permit'], '../public/study_permit', /jpg|jpeg|png|pdf/);
			reqData.study_permit = study_permit;
		}
		
		const saveUser = await User.create(reqData);
		const dataArray = {};

		if(type === 'RIDER'){
			let images = null;
			if(req.files && req.files.images){
				images = req.files.images;
			}

			const car = await storeCar(saveUser._id, number, totalSeat, req.files.primaryImage, images);
			dataArray.carDetail = car;
		}
		
		const accessToken = await signAccessToken(saveUser.id.toString());
    	const refreshToken = await signRefreshToken(saveUser.id.toString());

		dataArray.user = saveUser;
		dataArray.accessToken = accessToken;
		dataArray.refreshToken = refreshToken;

		return sendSuccessResponse(res,getMessage('REGISTRATION_SUCCESSFUL'), dataArray);
	}catch(error){
		return sendErrorResponse(res,error.message);
	}
}

const login = async(req, res)=>{
	try{
		const user = await User.findOne({ email: req.body.email });
    	if (!user) throw createError.NotFound(getMessage('USER_NOT_REGISTER'));

    	const isMatch = await bcrypt.compare(req.body.password, user.password);
		if (!isMatch) throw createError.Unauthorized(getMessage('INVALID_CREDENTIALS'));

		const accessToken = await signAccessToken(user.id.toString());
		const refreshToken = await signRefreshToken(user.id.toString());

		if(user.status === 'PENDING'){
			throw createError.Unauthorized(getMessage('PENDING_APPROVAL'));
		}else if(user.status === 'REJECTED'){
			throw createError.Unauthorized(getMessage('REJECTED_REGISTRATION'));
		}else{
			const dataArray = {};
			dataArray.user = user;
			dataArray.accessToken = accessToken;
			dataArray.refreshToken = refreshToken;
			return sendSuccessResponse(res, getMessage('USER_LOGIN_SUCCESSFULLY'), dataArray);
		}
	}catch(error){
		return sendErrorResponse(res,error.message);
	}
}

const refreshToken = async (req, res, next) => {
	try {
	  const { refreshToken } = req.body;
  
	  if (!refreshToken) {
		throw createError.NotFound(getMessage('REFRESH_TOKEN_NOT_FOUND'));
	  }
  
	  const userId = await verifyRefreshToken(refreshToken);
	  const newAccessToken = await signAccessToken(userId);
	  const newRefreshTOken = await signRefreshToken(userId);

	  const data = { accessToken: newAccessToken, newRefreshTOken };
	  return sendSuccessResponse(res, getMessage('TOKEN_GENERATED_SUCCESSFULY'), data);
	} catch (error) {
	  return sendErrorResponse(res, error.message);
	}
  };

  const verification = (req, res) => {
    try{
        const code = Math.floor(100000 + Math.random() * 900000);

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: config.mailer.user,
                pass: config.mailer.pass,
            }
        });

        const mailOptions = {
            from: config.mailer.user,
            to: req.body.email,
            subject: 'Your verification code...!!',
            text: `Your verification code is ${code}`
        };
        
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                return sendErrorResponse(res,'Verification failed');
            } else {
                return sendSuccessResponse(res,'Verification successfully', code);
            }

        });
    }catch(error){
        return sendErrorResponse(res,error.message);
    }
};

module.exports = {register, login, refreshToken, verification};