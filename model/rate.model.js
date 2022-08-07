const mongoose = require('mongoose');

const rateSchema = mongoose.Schema({
    rideId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "User",
        required: true,
      },
    userId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "User",
        required: true,
      },
    rate:{
      type:String,
      required: true,
    },
    comment:{
        type:String,
        required: true,
      },
  createdAt:{
    type: Date,
    default:()=>Date.now(),
    immutable: true
  },
  updatedAt: Date,
});

module.exports = mongoose.model('Rate',rateSchema);