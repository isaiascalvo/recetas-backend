var mongoose = require('mongoose');

var ingredientSchema= new mongoose.Schema({
  name: { type: String, required: true, unique:true },
    
},{timestamps:true});

ingredientSchema.set('toJSON', {getters: true, virtuals: true});
mongoose.model('ingredient', ingredientSchema);