const mongoose = require('mongoose');
const vehicleInfoSchema = mongoose.Schema({
    driver_id: { type: mongoose.Schema.Types.ObjectId, ref: 'signups' },
    driver_profile_id: { type: mongoose.Schema.Types.ObjectId, ref: 'profiles' },
    car_make: { type: String },
    car_model: { type: String },
    car_year: { type: String },
    car_color: {type : String},
    vehicle_name: {type: String},
    vehicle_plate_number:{type:String},
    upload_vehicle_registration: { type: String },
    upload_inssurance_card: { type: String },
    upload_driver_licence: { type: String },
    status: { type: Number },
    type: { type: Number },
    created_date: { type: Date }
})
// console.log("vehicleInfoSchema",vehicleInfoSchema);
module.exports = mongoose.model('vehicleInfos', vehicleInfoSchema);
