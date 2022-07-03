const message = {
    EMAIL_ALREADY_REGISTERED: 'This email is already been registered',
    REGISTRATION_SUCCESSFUL: 'Registration Successful',
    USER_NOT_REGISTER: 'User not registered',
    INVALID_CREDENTIALS: 'Usermame and Password Invalid',
    USER_LOGIN_SUCCESSFULLY: 'User login successfully',
    CAR_DETAIL_ALREADY_STORED: 'This car details are already been stored',
    CAR_DEATIL_STORED_SUCCESSFULLY: 'Car detail succesfully stored',
    REFRESH_TOKEN_NOT_FOUND: 'Refresh token not found',
    TOKEN_GENERATED_SUCCESSFULY: 'Token Generated Successfuy',
    PLEASE_SELECT_IMAGE: 'Please select image',
    PLEASE_SELECT_PRIMARY_CAR_IMAGE: 'Please select primary car image',
    RIDE_ADD_SUCCESS: 'Ride Add Successfull',
    RIDE_ALREDY_ADDED: 'Ride alredy added',
    RIDE_AD_RETRIEVED_SUCCESS: 'Ride add retrived success',
    REQUEST_ALREADY_EXIST: 'You Already Request for this!',
    User_Request_Submited_SUCCESSFULLY: 'User_Request_Submited_SUCCESSFULLY!',
    ALL_REQ_GET_SUCCESS: 'All Request for your ride is get Successfully!!',
    UPDATE_REQUEST: 'Ride Request Updated Successfully!',
    SAVE_RATING: 'Your Rating Submited Successfully!',
    RIDER_ADD_DOEST_NOT_EXIST:'Rider add does not exist',
    INVALID_NUMBER_ENTERED: 'Invalid number entered',

};

const getMessage = (key)=>{
    if(message[key]) return message[key];
    return 'Message key not found';
}

module.exports = getMessage;