const mongoose = require('mongoose');
const bcrypt = require("bcrypt");

const userType = ['USER','RIDER'];
const config = require('../config/config');

const UserSchema = mongoose.Schema({
	fname:{
		type: String,
	  required: true
	},
  lname:{
		type: String,
		required: true
	},
	email: {
    type: String,
    required: true,
    unique: true,
  },
  phone:{
    type: String,
    required: true,
    unique: true,
  },
  gender:{
    type: String,
    enum: ['MALE','FEMALE'],
    required: true,
  },
  dob:{
    type: String,
    required: true,
  },
  address:{
    type: String,
    required: true,
  },
  country:{
    type: String,
    required: true,
  },
  state:{
    type: String,
    required: true,
  },
  city:{
    type: String,
    required: true,
  },
  zip_code:{
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  image:{
    type:String,
    get: getImage,
  },
  type:{
    type: String,
    enum: userType,
  },
  proof:{
    type: String,
    required: isProofRequired,
    get: getProof,
  },
  study_permit:{
    type: String,
    required: isProofRequired,
    get: getStudyPermit,
  },
  isVerified: {
    type: Boolean,
    required: true,
    default : false,
  },
  isActive:{
    type: Boolean,
    required: true,
    default : true,
  },
  status:{
    type: String,
    enum:  ['PENDING','ACCEPTED','REJECTED'],
    default: 'PENDING',
  },
  createdAt:{
    type: Date,
    default:()=>Date.now(),
    immutable: true,
  },
  updatedAt: Date,
},
{ toJSON: { getters: true }}
);

function isProofRequired(){
  if(userType.indexOf(this.type) === 1){
    return true;
  }
  return false;
}


function getImage(val){
  return config.url + 'images/' + val;
}

function getProof(val){
  return config.url + 'proof/' + val;
}

function getStudyPermit(val){
  return config.url + 'study_permit/' + val;
}

UserSchema.pre('save',async function(next){
  try{
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password,salt);
    this.password = hashedPassword;
    next();
  }catch(error){
    next(error);
  }
});

module.exports = mongoose.model('User',UserSchema);