const Car = require('../model/car.model');
const UserCar = require('../model/user-car.model');
const path = require('path');

const {sendSuccessResponse,sendErrorResponse} = require('../utils/response');
const getMessage = require('../utils/message');
const {checkFile, uploadFile, fileCheckAndUpload} = require('../utils/file-upload');
const mongoose = require('mongoose');

const storeCarDetail = async (req, res)=>{
    try{

        if(!req.files || !req.files.primaryImage){
            throw new Error(getMessage('PLEASE_SELECT_PRIMARY_CAR_IMAGE'));
        }

        const primaryImage = await fileCheckAndUpload(req.files.primaryImage, '../public/car_images');

        const {number, totalSeat} = req.body;
        const userId = req.payload.aud;
        const existCar = await Car.exists({number});
		
		if(existCar) return sendErrorResponse(res,getMessage('CAR_DETAIL_ALREADY_STORED'));
        
        const saveCar = await Car.create({
            userId,
            number,
            totalSeat,
            primaryImage
        });

        if(saveCar){
            var pic = (req.files && req.files.images) ? req.files.images : []
            files_param = req.files;
            if (files_param && typeof pic.length === "undefined") {
                console.log('single file',pic.name);
                var fileName = 'car_' + Date.now() + path.extname(pic.name);
                var newpath = "./public/car_images/" + fileName;
                pic.mv(newpath, async function (err) {
                    image_set = {
                        'carId': saveCar.id,
                        'image': fileName//'car_'+ pic.md5 + path.extname(pic.name),
                    };    
                    const saveCarImages = await UserCar.create(image_set);
                    if (!saveCarImages) { return sendErrorResponse('Error uploading file.',err); }
                });
            } else {
                console.log('multiple file');
                for (let picone of pic) {
                    var fileName = 'car_'+ Date.now() + path.extname(picone.name);
                    var newpath = "./public/car_images/" + fileName;
                    picone.mv(newpath,async function(err) {
                        if (err) { result("Error uploading file.", err); return; }
                        try {
                            image_set = {
                                'carId': saveCar.id,
                                'image': fileName//'car_'+ pic.md5 + path.extname(pic.name),
                            };    
                            const saveCarImages = await UserCar.create(image_set);
                        } catch (error) {
                            console.log('Image Uploding error',error);
                        }
                    });                        
                }
            }
        }
        // File Upload : End 

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
        
        const { number, totalSeat} = req.body;
        const dataArray = {};
        if(req.files && req.files.primaryImage){
            dataArray.primaryImage =  await fileCheckAndUpload(req.files.primaryImage, '../public/car_images'); 
        }

        if(number){
            dataArray.number = number;
        }

        if(totalSeat){
            dataArray.totalSeat = totalSeat;
        }

        var UpdateCar = await Car.updateOne({'_id':carId},{$set:dataArray});

        if(UpdateCar){
            var pic = (req.files && req.files.images) ? req.files.images : []
            files_param = req.files;
            if (files_param && typeof pic.length === "undefined") {
                var fileName = 'car_' + Date.now() + path.extname(pic.name);
                var newpath = "./public/car_images/" + fileName;
                pic.mv(newpath, async function (err) {
                    image_set = {
                        'carId': carId,
                        'image': fileName//'car_'+ pic.md5 + path.extname(pic.name),
                    };    
                    const saveCarImages = await UserCar.create(image_set);
                    if (!saveCarImages) { return sendErrorResponse('Error uploading file.',err); }
                });
            } else {
                for (let picone of pic) {
                    var fileName = 'car_'+ Date.now() + path.extname(picone.name);
                    var newpath = "./public/car_images/" + fileName;
                    picone.mv(newpath,async function(err) {
                        if (err) { result("Error uploading file.", err); return; }
                        try {
                            image_set = {
                                'carId': carId,
                                'image': fileName//'car_'+ pic.md5 + path.extname(pic.name),
                            };    
                            const saveCarImages = await UserCar.create(image_set);
                        } catch (error) {
                            console.log('Image Uploding error',error);
                        }
                    });                        
                }
            }
        }
        // File Upload : End 
        const result = await Car.aggregate([
            {
                $match:{_id: mongoose.Types.ObjectId(carId)}
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

        return sendSuccessResponse(res,getMessage('CAR_DEATIL_UPDATED_SUCCESSFULLY'), result);

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

module.exports= {storeCarDetail, carList, carUpdate, carDelete, deleteCarImages};