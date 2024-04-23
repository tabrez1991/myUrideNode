const mongoose = require('mongoose');
const usersSchema = mongoose.Schema({
    email: { type: String, unique: true },
    username: { type: String, unique: true },    
    password: { type: String },
    mobile: {type: String},
    name : {type: String},
    email_verified: { type: Number },
    profile_picture: {type: String},
    roles : {type : Array},
    status: { type: String },
    jwttoken: { type: String }, 
    refreshToken: { type: String },
    last_login: {type: Date},
    creation_date: { type: Date },
    updated_date: { type: Date },
    lastName: { type: String },
    middleName : {type: String},

})
module.exports = mongoose.model('users', usersSchema);
 