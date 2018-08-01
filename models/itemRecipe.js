var mongoose = require('mongoose');

var itemRecipeSchema= new mongoose.Schema({
  quantity: {type:String,required:true},
  ingredient: { type: mongoose.Schema.Types.ObjectId, ref: 'ingredient', required: true },
  recipe: { type: mongoose.Schema.Types.ObjectId, ref: 'recipe', required: true },

},{timestamps:true});

itemRecipeSchema.set('toJSON', {getters: true, virtuals: true});
mongoose.model('itemRecipe', itemRecipeSchema);