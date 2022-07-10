const mongoose = require('mongoose');

const UserAdSchema = mongoose.Schema({
    user_id: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "User",
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
      budget:{
        type: Number,
        required: true,
      },
      no_of_person:{
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

module.exports = mongoose.model('UserAd',UserAdSchema);