
const mongoose = require('mongoose');
const paymentSchema = mongoose.Schema({
    user_id: { type: String },
    status: { type: String },
    created_at: { type: Date }
})

module.exports = mongoose.model('payments', paymentSchema);
