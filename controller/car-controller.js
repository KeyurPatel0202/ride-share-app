const Car = require('../model/car.model');
const UserCar = require('../model/user-car.model');
const path = require('path');

const {sendSuccessResponse,sendErrorResponse} = require('../utils/response');
const getMessage = require('../utils/message');
const {checkFile, uploadFile, fileCheckAndUpload} = require('../utils/file-upload');
const mongoose = require('mongoose');

const storeCar = async (userId, number, totalSeat, primaryImage, images = null) => { 

    const existCar = await Car.exists({number});
    
    if(existCar) throw new Error(getMessage('CAR_DETAIL_ALREADY_STORED'));
    
    const primaryImageName = await fileCheckAndUpload(primaryImage, '../public/car_images');

    const saveCar = await Car.create({
        userId,
        number,
        totalSeat,
        primaryImage:primaryImageName
    });

    if(images){ 
        const len = images.length;
        for(let i =0;i<len;i++){
            const file = images[i];
            const ext = path.extname(file.name).toLowerCase().split('.')[1];
            const fileTypes = /jpeg|jpg|png/;
            const extname = fileTypes.test(ext);
    
            if (!extname) {
                continue;
            }

            const fileName = new Date().getTime().toString() + i + '.' +ext;
            const filePath = "./public/car_images/" + fileName;

            file.mv(filePath, async function (err) {
                const imageSet = {
                    'carId':saveCar.id,
                    'image': fileName,
                };

                await UserCar.create(imageSet);
            });
        }
    }

    return saveCar;
}

const storeCarDetail = async (req, res)=>{
    try{
        const userId = req.payload.aud;

        if(!req.files || !req.files.primaryImage){
            throw new Error(getMessage('PLEASE_SELECT_PRIMARY_CAR_IMAGE'));
        }

        let images = null;
        if(req.files && req.files.images){
            images = req.files.images;
        }

        const saveCar = await storeCar(userId, number, totalSeat, req.files.primaryImage, images);
        return sendSuccessResponse(res,getMessage('CAR_DEATIL_STORED_SUCCESSFULLY'), saveCar);

    }catch(error){
        return sendErrorResponse(res,error.message);
    }
};

const carList = async (req, res)=>{
    try{
        const userId = req.payload.aud;
       
            const result = await Car.aggregate([
                {
                    $match:{userId: mongoose.Types.ObjectId(userId)}
                },
                {
                    $lookup:{
                        from: 'usercars',
                        localField: '_id',
                        foreignField: 'carId',
                        as: 'car_images'
                    }
                }
            ]);
    
            return sendSuccessResponse(res,getMessage('ALL_CAR_GET_SUCCESS'), result);
    }catch(error){
        return sendErrorResponse(res,error.message);
    }
};

const carUpdate = async (req, res)=>{
    try{
        const userId = req.payload.aud;
        const carId = req.params.id;
        
        const car = await Car.findOne({_id:mongoose.Types.ObjectId(carId)});
        if(!car){
            return sendErrorResponse(res,getMessage('CAR_NOT_FOUD'));
        }

        const { number, totalSeat} = req.body;

        if(req.files && req.files.primaryImage){
            car.primaryImage =  await fileCheckAndUpload(req.files.primaryImage, '../public/car_images'); 
        }

        if(number){
            car.number = number;
        }

        if(totalSeat){
            car.totalSeat = totalSeat;
        }

        await Car.updateOne({'_id':carId},{$set:car});

        if(req.files && req.files.images){
            const images = req.files.images;
            
            const len = images.length;
            for(let i =0;i<len;i++){
                const file = images[i];
                const ext = path.extname(file.name).toLowerCase().split('.')[1];
                const fileTypes = /jpeg|jpg|png/;
                const extname = fileTypes.test(ext);
        
                if (!extname) {
                    continue;
                }

                const fileName = new Date().getTime().toString() + i + '.' +ext;
                const filePath = "./public/car_images/" + fileName;

                file.mv(filePath, async function (err) {
                 
                    const imageSet = {
                        carId,
                        'image': fileName,
                    };

                    await UserCar.create(imageSet);
                });
            }
        }

        return sendSuccessResponse(res,getMessage('CAR_DEATIL_UPDATED_SUCCESSFULLY'), car);

    }catch(error){
        return sendErrorResponse(res,error.message);
    }   
};

const carDelete = async (req, res)=>{
    try{
        const userId = req.payload.aud;
        const _id = req.params.id;
        
        const carId = req.params.id;
        const deleteCar = await Car.remove({
            userId,
            _id,
        });
        
        if(deleteCar)
        {
            const deleteUserCar = await UserCar.remove({
                carId,
            }); 
        }
        return sendSuccessResponse(res,getMessage('CAR_DEL_SUCCESS'));
    }catch(error){
        return sendErrorResponse(res,error.message);
    }   
};

const deleteCarImages = async (req, res) =>{
    try{
        const ids = req.body.ids;
        const result = await UserCar.deleteMany({_id:{$in:ids}});

        return sendSuccessResponse(res,getMessage('CAR_IMAGE_DELETED_SUCCESSFULLY'));

    }catch(error){
        return sendErrorResponse(res,error.message);
    }
}

module.exports= {storeCar,storeCarDetail, carList, carUpdate, carDelete, deleteCarImages};