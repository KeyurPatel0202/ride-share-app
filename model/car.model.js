const mongoose = require('mongoose');

const CarSchema = mongoose.Schema({
    userId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "User",
        required: true,
      },
    number:{
        type: Number,
        required: true,
        unique: true,
    },
    totalSeat:{
        type: Number,
        required: true,
    },
    primaryImage:{
      type:String,
    },
  createdAt:{
    type: Date,
    default:()=>Date.now(),
    immutable: true
  },
  updatedAt: Date,
});

module.exports = mongoose.model('Car',CarSchema);