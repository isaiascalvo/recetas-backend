var mongoose = require('mongoose');

var imageSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    url: { type: String, required: true },

}, { timestamps: true });

imageSchema.set('toJSON', { getters: true, virtuals: true });
mongoose.model('image', imageSchema);