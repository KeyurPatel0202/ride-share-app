const mongoose = require('mongoose');
const bcrypt = require("bcrypt");

const UserRatingSchema = mongoose.Schema({
    user_id:{
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true
    },
    rider_id:{
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true
    }, 
    user_type:{
    type: String,
    enum:['USER','RIDER'],
    default: 'RIDER'
    },
    comment:{
      type: String,
      isRequired: true
    },
    date:{
      type: Date,
      default:()=>Date.now(),
      immutable: true
    },
  rating: {
      type: Number,
      isRequired: true
    }
  });

module.exports = mongoose.model('UserRating',UserRatingSchema);