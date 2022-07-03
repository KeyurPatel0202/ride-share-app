const Car = require('../model/car.model');
const UserCar = require('../model/user-car.model');

const {sendSuccessResponse,sendErrorResponse} = require('../utils/response');
const getMessage = require('../utils/message');
const {checkFile, uploadFile, fileCheckAndUpload} = require('../utils/file-upload');

const storeCarDetail = async (req, res)=>{
    try{

        if(!req.files || !req.files.primaryImage){
            throw new Error(getMessage('PLEASE_SELECT_PRIMARY_CAR_IMAGE'));
        }

        let carImages = false;
        if(req.files && req.files.images){
            req.files.images.map(file => {
                checkFile(file);
            });
            carImages = true;
        }

        const primaryImage = await fileCheckAndUpload(req.files.primaryImage, '../public/car_images');

        const {number, totalSeat} = req.body;
        userId = req.payload.aud;
        const existCar = await Car.exists({userId});
		
		if(existCar) return sendErrorResponse(res,getMessage('CAR_DETAIL_ALREADY_STORED'));
        
        const saveCar = await Car.create({
            userId,
            number,
            totalSeat,
            primaryImage
        });

        if(saveCar && carImages){
            const promises = req.files.images.map(file => {
                return uploadFile(file, '../public/car_images');
            });
           
            const getCarImages = await Promise.all(promises);

            const storeImages = getCarImages.map(image => {
            const dataArray = {};
            dataArray.carId = saveCar.id;
            dataArray.image = image;
            return dataArray;
           });

           await UserCar.create(storeImages);
        }

        return sendSuccessResponse(res,getMessage('CAR_DEATIL_STORED_SUCCESSFULLY'), saveCar);

    }catch(error){
        return sendErrorResponse(res,error.message);
    }
};

module.exports= {storeCarDetail};