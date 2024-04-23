const mongoose = require('mongoose');
const backgroundcheckSchema = mongoose.Schema({
    driver_id: { type: mongoose.Schema.Types.ObjectId, ref: 'signups' },
    legal_first_name: { type: String },
    legal_middle_name: { type: String },
    legal_last_name: { type: String },
    license_number: { type: String },
    license_state: { type: String },   
    license_zipCode: { type: String },
    dob: { type: String },
    ssn: { type: String },
    status: { type: Number },
    type: { type: Number },
    created_date: { type: Date }
    
})
module.exports = mongoose.model('backgroundchecks', backgroundcheckSchema);
