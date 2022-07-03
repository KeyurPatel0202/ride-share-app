const riderAdd = require('../model/rider-add.model');
const {sendSuccessResponse,sendErrorResponse} = require('../utils/response');
const createError = require("http-errors");
const getMessage = require('../utils/message');
const RiderAd = require('../model/rider-add.model');
const mongoose = require('mongoose');

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
        const search = req.query.search;

        const query = [
            {
                $match: {
                        start_date: {
                        $gte: new Date(), 
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
        
        const getAdRide = await RiderAd.aggregate(query);

        return sendSuccessResponse(res, getMessage('RIDE_AD_RETRIEVED_SUCCESS'), getAdRide);
    }catch(error){
        return sendErrorResponse(res,error.message);
    }
}

module.exports = {adRide, showAdRide};