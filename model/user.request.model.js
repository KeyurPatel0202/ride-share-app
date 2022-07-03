const mongoose = require('mongoose');

const UserRequestSchema = mongoose.Schema({
    user_id:{
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      required: true,
    },
    ride_ad_id:{
      type: mongoose.SchemaTypes.ObjectId,
      ref: "RiderAd",
      required: true,
    },
    no_of_seat:{
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING','ACCEPTED','REJECTED','COMPLETED'],
      default : 'PENDING',
    },
    is_completeted:{
      type: Boolean,
      isRequired: true,
      default : false
    },
    createdAt:{
      type: Date,
      default:()=>Date.now(),
      immutable: true
    },
    updatedAt: Date,
});

module.exports = mongoose.model('UserRequest',UserRequestSchema);