const mongoose = require('mongoose');
const signupSchema = mongoose.Schema({
    email: { type: String, unique: true },
    username: { type: String, unique: true },    
    password: { type: String },
    status: { type: Number },
    role_id:{ type: Number },
    otp: { type: Number },    
    email_verified: { type: Number },
    jwttoken: { type: String }, 
    refreshToken: { type: String },  
    device_id: { type: String },
    device_token: { type: String },
    device_type : {type: String},
    created_date: { type: Date },
    updated_date: { type: Date }
})
module.exports = mongoose.model('signups', signupSchema);
 