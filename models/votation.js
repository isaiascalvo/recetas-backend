var mongoose = require('mongoose');

var votationSchema= new mongoose.Schema({
  points: { type: Number, required: true },
  user:{ type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  recipe:{ type: mongoose.Schema.Types.ObjectId, ref: 'recipe', required: true }
    
},{timestamps:true});

votationSchema.set('toJSON', {getters: true, virtuals: true});
mongoose.model('votation', votationSchema);