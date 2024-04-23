const mongoose = require('mongoose');
const feedbackSchema = mongoose.Schema({
    profile_id: { type: mongoose.Schema.Types.ObjectId, ref: 'profiles' },
    mobile: { type: String },
    description: { type: String },
    rating: { type: String },
    full_name: {type : String},
    created_date: { type: Date }
})
module.exports = mongoose.model('feedback', feedbackSchema);
