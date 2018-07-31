var mongoose = require('mongoose');
//var moment = require('moment');

var recipeSchema= new mongoose.Schema({
  name:{type:String, required:true},
  time:{type:Number, required:true},
  description:{type:String, required:true},
  items:[{type: mongoose.Schema.Types.ObjectId, ref:'itemRecipe'}],
  preparation: [{ type: String }],
  votes:{type:Number},
  punctuation:{type:Number},
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  category:[{type: mongoose.Schema.Types.ObjectId, ref: 'category'}],

},{timestamps:true});


recipeSchema.set('toJSON', {getters: true, virtuals: true});
mongoose.model('recipe', recipeSchema);