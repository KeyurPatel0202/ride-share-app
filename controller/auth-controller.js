const User = require('../model/user.model');
const {sendSuccessResponse,sendErrorResponse} = require('../utils/response');
const bcrypt = require('bcrypt');
const createError = require("http-errors");
const getMessage = require('../utils/message');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt-helper');
const {fileCheckAndUpload} = require('../utils/file-upload');

const register = async (req, res)=>{		
	try{
		if(!req.files || !req.files.image){
			throw new Error(getMessage('PLEASE_SELECT_IMAGE'));
		}
		
		const {fname,lname,phone,email,password,type} = req.body;
		const exist = await User.exists({email});
		
		if(exist){
			return sendErrorResponse(res,getMessage('EMAIL_ALREADY_REGISTERED'));
		}

		const image = await fileCheckAndUpload(req.files['image'], '../public/images');

		const reqData = {
			fname,
			lname,
			phone,
			email, 
			password,
			type,
			image
		}

		if(req.files.proof){
			const proof = await fileCheckAndUpload(req.files['proof'], '../public/proof',/pdf/);
			reqData.proof = proof;
		}
		
		const saveUser = await User.create(reqData);
		
		const accessToken = await signAccessToken(saveUser.id.toString());
    	const refreshToken = await signRefreshToken(saveUser.id.toString());

    	const dataArray = {};

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

		const dataArray = {};
		dataArray.user = user;
		dataArray.accessToken = accessToken;
		dataArray.refreshToken = refreshToken;
		
		return sendSuccessResponse(res, getMessage('USER_LOGIN_SUCCESSFULLY'), dataArray);
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

module.exports = {register, login, refreshToken};