const mongoose = require('mongoose');
const faqSchema = mongoose.Schema({    
    title: { type: String },
    desc: { type: String },
    status: {type : Number},
    created_date: { type: Date},
    updated_date: { type: Date }   
})
module.exports = mongoose.model('faqs', faqSchema);