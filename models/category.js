var mongoose = require('mongoose');

var categorySchema= new mongoose.Schema({
  name: { type: String, required: true, unique:true },
  description:{type:String,required:true},
    
},{timestamps:true});

categorySchema.set('toJSON', {getters: true, virtuals: true});
mongoose.model('category', categorySchema);