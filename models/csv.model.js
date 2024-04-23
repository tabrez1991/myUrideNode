const mongoose = require('mongoose');
const csvSchema = mongoose.Schema({
   model_id:{type:Number},
   //make_name:{type:String},
 //model_id:{type:Number},
   model_make_id:{type:String},
   model_name:{type:String},
   model_trim:{type:String},
   model_year:{type:String},
  status:{type: Number},        
   created_date: { type: Date },
   updated_date: { type: Date }
    

})
module.exports = mongoose.model('csvfiles', csvSchema);
