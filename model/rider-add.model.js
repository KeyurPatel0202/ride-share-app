const mongoose = require('mongoose');

const RiderAdSchema = mongoose.Schema({
    user_id: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "User",
        required: true,
      },
    car_id: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Car",
        required: true,
      },
      from:{
        type: String,
        required: true
      },
      to: {
        type: String,
        required: true,
      },
      amount:{
        type: Number,
        required: true,
      },
      start_date:{
          type: Date,
          required: true,
      },
      start_time: {
          type: String,
          required: true,
      },
      createdAt:{
        type: Date,
        default:()=>Date.now(),
        immutable: true
      },
      updatedAt:{
        type: Date,
        immutable: true
      },
});

module.exports = mongoose.model('RiderAd',RiderAdSchema);