const Rate = require('../model/rate.model');

const {sendSuccessResponse,sendErrorResponse} = require('../utils/response');
const getMessage = require('../utils/message');
const mongoose = require('mongoose');

const addRating = async (req, res) => {
    try{
        const userId = req.payload.aud;
        const {rideId, rate, comment} = req.body;

        const exist = await Rate.findOne({
            rideId:mongoose.Types.ObjectId(rideId),
            userId:mongoose.Types.ObjectId(userId)
        });

        if(exist){
            throw new Error(getMessage('RATE_ALREDY_GIVEN'));
        }

        const result = await Rate.create({
            rideId,
            userId,
            rate,
            comment,
        });

        return sendSuccessResponse(res, getMessage('RATE_GIVEN_SUCCESS'), result);

    }catch(error){
        return sendErrorResponse(res, error.message);
    }
}

const deleteRating = async(req, res) => {
    try{
        const id = req.params.id;
        const userId = req.payload.aud;

        const rate = await Rate.exists({_id:mongoose.Types.ObjectId(id)});
        if(!rate){
            throw new Error(getMessage('RATE_NOT_FOUND'));
        }

        const result = await Rate.deleteOne({_id:id});

        return sendSuccessResponse(res, getMessage('RATE_DELETED_SUCCESS'), result);
    }catch(error){
        return sendErrorResponse(res, error.message);
    }
}

const updateRate = async(req, res) =>{
    try{
        const id = req.params.id;
        const userId = req.payload.aud;

        const exist = await Rate.findOne({_id:mongoose.Types.ObjectId(id)});

        if(!exist){
            throw new Error(getMessage('RATE_NOT_FOUND'));
        }

        const {rideId, rate, comment} = req.body;

        const updateData = {
            rate: rate || exist.rate,
            comment: comment || exist.comment,
        };

        const result = await Rate.updateOne({_id:mongoose.Types.ObjectId(id)},{$set:updateData});

        updateData.id = id;
        updateData.userId = userId;
        
        return sendSuccessResponse(res, getMessage('RATE_UPDATED_SUCCESS'), updateData);

    }catch(error){
        return sendErrorResponse(res, error.message); 
    }
}

const getRate = async(req, res) => {
    try{
        const rideId = req.params.id;

        const rates = await Rate.find({
            rideId: mongoose.Types.ObjectId(rideId),
        });

        if(!rates.length) throw new Error(getMessage('NO_RATES_FOUND_FOR_THIS_RIDE'));

        return sendSuccessResponse(res, getMessage('RATE_RETRIEVED_SUCCESS'), rates); 
    }catch(error){
        return sendErrorResponse(res, error.message);
    }
}

module.exports = {addRating, deleteRating, getRate, updateRate};