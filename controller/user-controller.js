const UserRequest = require('../model/user.request.model');
const userRating = require('../model/user.rating.model');
const RiderAd  = require('../model/rider-add.model');
const User = require('../model/user.model');

const {sendSuccessResponse,sendErrorResponse} = require('../utils/response');
const createError = require("http-errors");
const getMessage = require('../utils/message');
const mongoose = require("mongoose");

const storeUserRequest = async (req, res) => {
    try{
        const { ride_ad_id, no_of_seat, status, is_complete} = req.body;
        const user_id = req.payload.aud;
        
        const existRequest = await UserRequest.exists({user_id,ride_ad_id});
		
		if(existRequest) throw new Error(getMessage('REQUEST_ALREADY_EXIST'));
        
        const riderAd = await RiderAd.aggregate([
            {
                $match: {_id: mongoose.Types.ObjectId(ride_ad_id)},
            },
            {
                $limit: 1
            },
            {
                $lookup: {
                        from: "cars",
                        localField: "car_id",
                        foreignField: "_id",
                        as: "car_detail",
                    },
            },
            {
                $unwind: "$car_detail"
            }
        ]);

        console.log({riderAd});
        if(!riderAd.length){
            throw new Error(getMessage('RIDER_ADD_DOEST_NOT_EXIST'));
        }

        const carSeats = riderAd[0]['car_detail']['totalSeat'];

        if(carSeats < no_of_seat){
            throw new Error(getMessage('INVALID_NUMBER_ENTERED'));
        }

        const requestedUsers = await UserRequest.aggregate([
            {
                $match: {ride_ad_id: mongoose.Types.ObjectId(ride_ad_id),status:'ACCEPTED'},
            },
            { $group: { _id: ride_ad_id, bookedSeat: { $sum: "$no_of_seat" } } }
            
        ]);

        const availableSeats =requestedUsers[0]? carSeats - requestedUsers[0]['bookedSeat'] : carSeats;

        if(availableSeats < no_of_seat){
            throw new Error(`Only ${availableSeats} are available`);
        }

        const saveUserRequest = await UserRequest.create({
            user_id,
            ride_ad_id,
            no_of_seat,
            status,
            is_complete
        });

        return sendSuccessResponse(res,getMessage('USER_REQUEST_SUBMITED_SUCCESSFULLY'), saveUserRequest);

    }catch(error){
        return sendErrorResponse(res,error.message);
    }
};

const getUserRequest = async (req, res) => {
    try{
        const {rider_ad_id, status} = req.query;
        const user_id = req.payload.aud;

        let whereStatement = {user_id};

        if(rider_ad_id){

           whereStatement.rider_ad_id = rider_ad_id;
        }
        if(status){
           whereStatement.status = status;
        }

      // const req_data = await db.collection('userrequests').find({user_id:ObjectId(user_id)}).toArray();

      /*const result = await UserRequest.aggregate([
        {
            $match: { user_id : mongoose.Types.ObjectId(user_id) },
        },
        {
            $lookup:{
                from: "riderads",
                localField: "_id",
                foreignField: "rider_ad_id",
                as: "rider_ad",
            }
        }
      ]);*/

      const result = await UserRequest.find(whereStatement).populate(
        {
            path:'rider_ad_id',
            populate:[
                {
                    path:'user_id',
                    select:{_id:0, fname:1, lname:1, email: 1, phone: 1, image:1}
                },
                {
                    path: 'car_id',
                    select:{number:1, totalSeat:1, primaryImage: 1},
                }
            ],
            
        });

        return sendSuccessResponse(res,getMessage('ALL_REQ_GET_SUCCESS'), result);

    }catch(error){
        return sendErrorResponse(res,error.message);
    }
};

const updateUserRequest = async (req, res)=>{
    try{
        const {r_id,user_id, rider_ad_id, status, is_complete} = req.body;
        let update = {user_id:user_id,rider_ad_id:rider_ad_id,status:status,is_complete:is_complete};
        var req_data = await db.collection("userrequests").updateOne({_id:ObjectId(r_id)},{$set:update});

        return sendSuccessResponse(res,getMessage('UPDATE_REQUEST'), req_data);

    }catch(error){
        return sendErrorResponse(res,error.message);
    }
};

const SubmitRating = async (req,res) => {
    const {rider_id,user_id,date,comment,rating} = req.body;
    try{
        let insert = {rider_id : rider_id,user_id:user_id,comment:comment,rating:rating};
        var rating_res = await userRating.create(insert);
        return sendSuccessResponse(res,getMessage('SAVE_RATING'), rating_res);
    }
    catch(error){
        return sendErrorResponse(res,error.message);
    }

}

async function userList(req,res){
    var {type,isVerified, isActive, status} = req.body;
    var query = {};
    query.isVerified = (typeof isVerified!= undefined) && isVerified != false ? true : false;
    try{
        var filter_data = [];
        var query={};
        if(type){
            query.type = type;
        }
        if(isVerified){
            query.isVerified = isVerified;
        }

        if(isActive){
            query.isActive = isActive;
        }

        if(status){
            query.status = status;
        }

        filter_data = await User.find(query);    
        return sendSuccessResponse(res,"ALL "+ type +" RETRIEVE SUCCESFULLY!" , filter_data);

    }
    catch(error){
        return sendErrorResponse(res,error.message);   
    }
}


async function updateStatus (req,res){
    var {user_id,status} = req.body;

   if(!status){
        return sendErrorResponse(res,getMessage('STATUS_FIELD_IS_REQUIRED'));   
   }
   if(!user_id){
        return sendErrorResponse(res, getMessage('USER_ID_FIELD_IS_REQUIRED'));   
   }
    try{
        var update_data = await User.updateOne( {_id: mongoose.Types.ObjectId(user_id)},{$set:{status}});
        console.log(update_data)
        return sendSuccessResponse(res, getMessage('USER_STATUS_UPDATED_SUCCESFULLY') , update_data);
    }
    catch(e){
        return sendErrorResponse(res,e.message);   
    }   
}

module.exports= {storeUserRequest, getUserRequest, updateUserRequest, SubmitRating, userList, updateStatus};