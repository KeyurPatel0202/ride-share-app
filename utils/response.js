const sendSuccessResponse = (res, message="success", data=[]) =>{
    return res.send({
        status:true,
        statusCode:200,
        message,
        data,
    });
};

const sendErrorResponse = (res, message="fail", statusCode = 500) =>{
    return res.send({
        status:false,
        statusCode,
        message,
    });
};

module.exports = {sendSuccessResponse,sendErrorResponse};