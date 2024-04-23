
const mongoose = require('mongoose');
const profileSchema = mongoose.Schema({
    profile_id: { type: mongoose.Schema.Types.ObjectId, ref: 'signups' },
    uuid: { type: String },
    fullname: { type: String },
    first_name : { type: String },
    middle_name: { type: String },
    last_name: { type: String },
    university_name: { type: String },
    student_id: { type: String },
    university_address: { type: String },
    mobile_no: { type: String },
    student_university_email: { type: String },
    dob: { type: String },
    //mobile_number: { type: String },
    house_number: { type: String },
    street_name: { type: String },
    street_address1: { type: String },
    street_address2: { type: String },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    zipcode: { type: String },
    ssn: { type: String },
    emergency_contact_no: { type: String },
    gender: { type: String },
    car_model: { type: String },
    vehicle_color: { type : String},
    destination_contact_number: { type: String },
    type: { type: Number },
    gender_preferences: { type: String },
    rider_preference: { type: String },
    phone_code: { type: String },
    phone_no: { type: String },
    profile_photo: { type: String },
    rating:{type: Number},   
    backgroundPayStatus : {type : Number},
    created_date: { type: Date },
    updated_date: { type: Date }


})

module.exports = mongoose.model('profiles', profileSchema);