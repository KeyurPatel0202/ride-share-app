const riderAdd = require('../model/rider-add.model');
const {sendSuccessResponse,sendErrorResponse} = require('../utils/response');
const createError = require("http-errors");
const getMessage = require('../utils/message');
const RiderAd = require('../model/rider-add.model');
const mongoose = require('mongoose');
const config = require('../config/config');
const nodemailer = require('nodemailer');
const _ = require('underscore');
const UserRequest = require('../model/user.request.model');
const User = require('../model/user.model');

const adRide = async (req, res) => {
    try{
        const {car_id, from, to, amount, start_date, start_time} = req.body;
        const user_id = req.payload.aud;

        const splitDate = start_date.split('-');
        const newDate = `${splitDate[2]}-${splitDate[1]}-${splitDate[0]}`;
        //const startDate = new Date(newDate);
        const startDate = `${newDate}T00:00:00.000+00:00`;

        const data = {user_id, car_id, start_date:startDate, start_time};
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
        const getAdRide = await showAdRideData(req);
        return sendSuccessResponse(res, getMessage('RIDE_AD_RETRIEVED_SUCCESS'), getAdRide);
    }catch(error){
        return sendErrorResponse(res,error.message);
    }
}

const showAdRideData = async(req) =>{
    const search = req.query.search;
    const now = new Date();
    now.setHours(0,0,0,0);
    now.setDate(now.getDate()-1)
    
    const query = [
        {
            $match: {
                    start_date: {
                    $gte: now, 
                },
                status: 'NOT_STARTED',
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "user_id",
                foreignField: "_id",
                as: "rider_detail",
            }
        },
        {
            $unwind: "$rider_detail"
        },
        {
            $lookup: {
                from: "cars",
                localField: "car_id",
                foreignField: "_id",
                as: "car_detail",
            }
        },
        {
            $unwind: "$car_detail"
        },
        {
            $lookup:{
                from: 'userrequests',
                localField:'_id',
                foreignField: 'ride_ad_id',
                as: 'user_requested',
                let: {
                    status: 'ACCEPTED'
                  },
                  pipeline: [
                    { $match: {
                        $expr: { $and: [
                            { $eq: [ "$status", "$$status" ] }
                        ] }
                    } }
                  ],
            }
        },
        {
            $project:{
                _id: 1,
                from: 1,
                to: 1,
                amount: 1,
                start_date: 1,
                start_time: 1,
                available_seat:{
                    $subtract:['$car_detail.totalSeat',{
                        $sum: '$user_requested.no_of_seat'
                    }]
                },
                rider_detail:{
                    _id:1,
                    fname:1,
                    lname:1,
                    email:1,
                    phone:1,
                    image:1,
                },
                car_detail:{
                    _id:1,
                    number:1,
                    totalSeat:1,
                    primaryImage:1,
                }
            },
            
        },
        {
            $match:{available_seat:{$gt:0}}
        }
    ];

    
    if(search){
        const applySearch =  { $regex: search, $options: "i" };

        query[0]['$match'] = {
            ...query[0]['$match'],
            $or: [
              { from: applySearch },
              { to: applySearch },
            ],
          };
    }

    if(req.query.start_time){
        query[0]['$match'] = {
            ...query[0]['$match'],
            $and: [
              { start_time: req.query.start_time },
            ],
          };
    }

    if(req.query.id){
        query[0]['$match'] = {...query[0]['$match'],
            $and: [{_id: mongoose.Types.ObjectId(req.query.id)}]
        }
    }
    
    const getAdRide = await RiderAd.aggregate(query);

    if(!getAdRide.length){
        throw new Error(getMessage('NO_RIDES_FOUND'));
    }

    return getAdRide;
}

const riderRequestAction = async(req,res)=>{
    try{
            // console.log(req.body)
        const action = req.body.action;

        let rider_id = req.payload.aud;
        let {request_id} = req.body;
        switch(action){

        //case 1: Admin User ni request reject krshe ,  jo approve thyeli hase to
            case 'reject_user_request_by_rider' : //by rider
                // rider add id is rider ad is and user id the user id of user whowant to request for ride
                await rejectUserRequestByRider(request_id,rider_id);
                break;
        //case 2 : User Request Delete krshe JO aeni Accept kreli Hase to Rider ne mail moklvano chhe
            case 'reject_ride_request_by_user' : //by user
                //let {request_id} = req.body; // rider add id is rider ad is and user id the user id of user whowant to request for ride
                await rejectRideRequestByUser(request_id);
                break;

        //Case 3 :  Ride j delete Thase ae case ma badha user ne mail moklvano chhe
            case 'delete_ride_by_rider' : //by Rider
                //let {request_id} = req.body; // rider add id is rider ad is and user id the user id of user whowant to request for ride
                await deleteRideByRider(request_id);
                break;
                
            default :
            break;
        }
        setTimeout(function(){
            return sendSuccessResponse(res,action+ "successfully " , []);
        },200);
    }catch(error){
        return sendErrorResponse(res, error.message);
    }
    
}
async function rejectUserRequestByRider(request_id,rider_id){
    try{ 
        const reject_request = await UserRequest.findOneAndUpdate({_id:mongoose.Types.ObjectId(request_id),status:"ACCEPTED"},{$set:{status:"REJECTED"}})
        // console.log(reject_request)
        if(reject_request){
            const user_id = reject_request.user_id;
            const ride_ad_id = reject_request.ride_ad_id;
            const ride_data = await RiderAd.aggregate([
            {
                $match: {
                       _id:ride_ad_id
                    }
            },
            {
                $limit: 1
            },
            {
                $lookup: {
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "rider_detail",
                }
            },
            {
                $unwind: '$rider_detail'
            },
            {
                $project:{
                    _id: 1,
                    from: 1,
                    to: 1,
                    amount: 1,
                    start_date: 1,
                    start_time: 1,
                    rider_detail:1,
                }
                
            }]);
            
            const subject = "Ride Requested Rejection"
            const user_data = await User.findOne({_id:user_id});
            const email = user_data.email;
            const user_name = user_data.fname + " " + user_data.lname;
            
             const rider_name = ride_data[0].rider_detail.fname + " " + ride_data[0].rider_detail.lname;
          
            const text = "Dear User "+user_name+" your ride request "+ride_data[0].from+ " - "+ride_data[0].to + " on "+ride_data[0].start_date.toString()+ " at "+ ride_data[0].start_time.toString() +" is rejected by Rider "+ rider_name +" . Regards Ride Share App";
            // console.log(email,subject,text);
            await send_mail(email,subject,text);           
            return true;
        }
        else{
            throw new Error(getMessage('USER_REQUEST_NOT_EXISTS_OR_PENDING'));
        }
    }
    catch(e){
        throw e;
    }
}
async function rejectRideRequestByUser(request_id){
    try{
        var reject_request = await UserRequest.findOne({_id:mongoose.Types.ObjectId(request_id),status:"ACCEPTED"})
        
        if(reject_request){
            const user_id = reject_request.user_id;
            const ride_ad_id = reject_request.ride_ad_id;
            const no_of_seat = reject_request.no_of_seat;
           
            const user_ride_detials = await RiderAd.aggregate([
                {
                    $match: {
                           _id:ride_ad_id
                        }
                },
                {
                    $limit: 1
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "user_id",
                        foreignField: "_id",
                        as: "rider_detail",
                    }
                },
                {
                    $unwind: '$rider_detail'
                },
                {
                    $project:{
                        _id: 1,
                        from: 1,
                        to: 1,
                        amount: 1,
                        start_date: 1,
                        start_time: 1,
                        rider_detail:1,
                    }
                    
                }]);
            // const ride_data = await RiderAd.findOne({_id:ride_ad_id});
            const user_data = await User.findOne({_id:user_id});

            //console.log("User request rejected SUCCESS!")
            const subject = "Ride Requested Rejection by user";

            const user_name = user_data.fname + " "+user_data.lname;
            const rider_name = user_ride_detials[0].rider_detail.fname + " "+user_ride_detials[0].rider_detail.lname;
            const text = "Dear Rider"+rider_name+" your ride request "+user_ride_detials[0].from+ " - "+user_ride_detials[0].to + " on "+user_ride_detials[0].start_date+" at "+user_ride_detials[0].start_time+" is rejected by user "+user_name +". Regards Ride Share App";
           
            await send_mail(user_ride_detials[0].rider_detail.email,subject,text);
            
            await UserRequest.deleteOne({_id:mongoose.Types.ObjectId(request_id),status:"ACCEPTED"});

            return true;
        }
        else{
            throw new Error(getMessage('USER_REQUEST_NOT_EXISTS_OR_PENDING'));
        }
    }
    catch(e){
       throw e;
    }
}
async function deleteRideByRider(ride_ad_id){
    try{
        const ride_users = await UserRequest.find({ride_ad_id:mongoose.Types.ObjectId(ride_ad_id),status:"ACCEPTED",is_complete:false}).select('user_id')
        //console.log(ride_users)
        if(ride_users){
            const users = _.pluck(ride_users,"user_id");
            const users_email = await User.find({_id:{$in:users}}).select("email");
            const users_emails = _.pluck(users_email,"email");
            const ride_data = await RiderAd.findOne({_id:ride_ad_id})
            setTimeout(async function(){
             //console.log(ride_data)
                const subject = "Ride Has Been Canceled By Rider!";
                const text = "Dear User  your Ride "+ride_data.from+ " - "+ride_data.to + " on "+ride_data.start_date.toString()+ " at "+ ride_data.start_time.toString() +" is rejected by Rider . Regards Ride Share App";
                await send_mail(users_emails,subject,text);
            },200)
        }
        return ride_users
    }
    catch(error){
       throw error;
    }
}

function getUserEmail(user_id){
    //console.log("getUserEmail : -",user_id)
    return new Promise(async function(resolve,reject){
        const data =await User.findOne({_id:user_id});
        resolve(data.email);
    });
}

const send_mail = async (recipient,subject,text) => {
     try{  
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: config.mailer.user,
                pass: config.mailer.pass,
            }
        });

        // console.log(config.mailer.pass);
        const mailOptions = {
            from: config.mailer.user,
            to: recipient,
            subject: subject,
            text: text
        };
        
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error.message)
                return false;//sendErrorResponse(res,'Verification failed');
            } else {
                console.log("email sended successfully");
                return true;
            }

        });
    }catch(error){
        console.log(error.message)
        return false;
        //return sendErrorResponse(res,error.message);
    }
}

module.exports = {adRide, showAdRideData,showAdRide, riderRequestAction};