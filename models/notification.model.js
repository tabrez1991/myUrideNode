const mongoose = require('mongoose');
const notificationSchema = mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'signups' },
    type:{type : Number},
    message:{type : String},      
    created_date: { type: Date},
    updated_date: { type: Date }
 
})
module.exports = mongoose.model('notifications', notificationSchema);
