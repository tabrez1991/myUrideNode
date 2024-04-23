const mongoose = require('mongoose');
const destinationSchema = mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'signups' },
    name:{type:String},
    phone_no:{type:String},
    type:{type : Number},
    created_date: { type: Date},
    updated_date: { type: Date }
    

    
    

})
module.exports = mongoose.model('destinationContact', destinationSchema);
