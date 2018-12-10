var mongoose = require('mongoose');
var router = require('express').Router();
var Image = mongoose.model('image');


//Listar todas las Imagenes
router.get('/', (req, res, next) => {
    
    Image.find({})
        .then(imagens => {
            if (!imagens) { return res.sendStatus(401); }
            return res.json({ 'imagens': imagens })
        })
});

module.exports = router;