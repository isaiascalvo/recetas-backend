var mongoose = require('mongoose');

var reportSchema= new mongoose.Schema({
  recipe: { type: mongoose.Schema.Types.ObjectId, ref: 'recipe', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  description:{type:String,required:true},
    
},{timestamps:true});

reportSchema.set('toJSON', {getters: true, virtuals: true});
mongoose.model('report', reportSchema);