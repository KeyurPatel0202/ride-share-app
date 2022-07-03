const mongoose = require('mongoose');

const userCarSchema = mongoose.Schema({
    carId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "User",
        required: true,
      },
    image:{
      type:String,
    },
  createdAt:{
    type: Date,
    default:()=>Date.now(),
    immutable: true
  },
  updatedAt: Date,
});

module.exports = mongoose.model('UserCar',userCarSchema);