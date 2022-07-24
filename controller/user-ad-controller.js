const UserAd = require('../model/user-ad.model');
const {sendErrorResponse, sendSuccessResponse} = require('../utils/response'); 
const getMessage = require('../utils/message');
const mongoose = require('mongoose');

const postRideRequest = async(req, res) => {
    try{
        const {from, to, budget, no_of_person, start_date, start_time} = req.body;
        const userId = req.payload.aud;

        const splitDate = start_date.split('-');
        const newDate = `${splitDate[2]}-${splitDate[1]}-${splitDate[0]}`;
        //const startDate = new Date(newDate);
        const startDate = `${newDate}T00:00:00.000+00:00`;

        const data = {user_id:userId, from, to, start_date:startDate, start_time};

        const exists = await UserAd.exists(data);
        
        if(exists){
            throw new Error(getMessage('RIDE_REQUEST_ALREADY_EXISTS'));
        }

        const saveRideRequest = await UserAd.create({...data,budget, no_of_person});
        return sendSuccessResponse(res, saveRideRequest);

    }catch(error){
        return sendErrorResponse(res, error.message);
    }
};


const updateUserAd = async(req, res) => {
    try{
        const {from, to, budget, no_of_person, start_date, start_time} = req.body;
        const userId = req.payload.aud;
        const id = req.params.id;

        const exists = await UserAd.exists({_id: mongoose.Types.ObjectId(id)});
       
        if(!exists){
            throw new Error(getMessage('RIDE_REQUEST_NOT_EXISTS'));
        }

        const updateRideRequest = await UserAd.updateOne({_id:mongoose.Types.ObjectId(id)},{$set:{from, to, budget, no_of_person, start_date, start_time}});
        return sendSuccessResponse(res, getMessage('USER_RIDE_REQUEST_UPDATED_SUCCESSFULLY') );
        
    }catch(error){
        return sendErrorResponse(res, error.message);
    }
};

const getAllRideRequest = async(req, res) => {
    try{
        const rideRequests = await showRideRequestData(req);

        return sendSuccessResponse(res, getMessage('RIDE_REQUEST_RETRIVED_SUCCESS'), rideRequests);
    }catch(error){
        return sendErrorResponse(res, error.message);
    }
}

const showRideRequestData = async(req) =>{

    const now = new Date();
    now.setHours(0,0,0,0);
    now.setDate(now.getDate()-1)

    const query = [
        {
            $match: {
                    start_date: {
                    $gte: now, 
                },
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "user_id",
                foreignField: "_id",
                as: "user_detail",
            }
        },
        {
            $unwind: "$user_detail"
        },
        {
            $project:{
                _id: 1,
                from: 1,
                to: 1,
                budget:1,
                no_of_person:1,
                start_date:1,
                start_time:1,
                user_detail:{
                    _id:1,
                    fname:1,
                    lname:1,
                    email:1,
                    phone:1,
                    gender:1,
                    dob:1,
                    address:1,
                    country:1,
                    state:1,
                    city:1,
                    zip_code:1,
                    image:1
                }
            }
        }
    ];

    if(req.query.id){
        query[0]['$match'] = {...query[0]['$match'],
            $and: [{_id: mongoose.Types.ObjectId(req.query.id)}]
        }
    }

    if(req.query.search){
        const search = req.query.search;
        const applySearch =  { $regex: search, $options: "i" };
        query[0]['$match'] = {
            ...query[0]['$match'],
            $or: [
              { from: applySearch },
              { to: applySearch },
            ],
          };
    }

    const rideRequests = await UserAd.aggregate(query);
   
    if(!rideRequests.length){
        throw new Error(getMessage('NO_RIDE_REQUEST_FOUND'));
    }

    return rideRequests;
}

const deleteUserAd = async(req, res) =>{
    try{
        const userId = req.payload.aud;
        const id = req.params.id;

        const exists = await UserAd.exists({_id: mongoose.Types.ObjectId(id)});
       
        if(!exists){
            throw new Error(getMessage('RIDE_REQUEST_NOT_EXISTS'));
        }

        const deleteRideRequest = await UserAd.deleteOne({_id:mongoose.Types.ObjectId(id)});
        return sendSuccessResponse(res, getMessage('USER_RIDE_REQUEST_DELETED_SUCCESSFULLY') );
        
    }catch(error){
        return sendErrorResponse(res, error.message);
    }
}

module.exports = {postRideRequest, updateUserAd, showRideRequestData, getAllRideRequest, deleteUserAd};