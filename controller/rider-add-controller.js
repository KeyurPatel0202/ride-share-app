const riderAdd = require('../model/rider-add.model');
const {sendSuccessResponse,sendErrorResponse} = require('../utils/response');
const createError = require("http-errors");
const getMessage = require('../utils/message');
const RiderAd = require('../model/rider-add.model');

const adRide = async (req, res) => {
    try{
        const {car_id, from, to, amount, start_date, start_time} = req.body;
        const user_id = req.payload.aud;

        const data = {user_id, car_id, start_date, start_time};
        const exist = await riderAdd.exists(data);

        if(exist) throw new Error(getMessage('RIDE_ALREDY_ADDED'));
        const dataArray = {...data,amount, from, to}
        const result = await riderAdd.create(dataArray);

        return sendSuccessResponse(res,getMessage('RIDE_ADD_SUCCESS'), result);

    }catch(error){
        return sendErrorResponse(res,error.message); 
    }
};

const showAdRide = async(req, res) => {
    try{
        const getAdRide = await RiderAd.find({}).populate([{path:'user_id', model: 'User'},{path:'car_id',model:'Car'}]);
        return sendSuccessResponse(res, getMessage('RIDE_AD_RETRIEVED_SUCCESS'), getAdRide);
    }catch(error){
        return sendErrorResponse(res,error.message);
    }
}

module.exports = {adRide, showAdRide};