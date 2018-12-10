var mongoose = require('mongoose');

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

recipeSchema.virtual("Punctuation").get(function(){
  if (this.votes !== 0)
  {
    return (this.punctuation/this.votes);
  } else {
    return 0;
  }
});

recipeSchema.set('toJSON', {getters: true, virtuals: true});
mongoose.model('recipe', recipeSchema);