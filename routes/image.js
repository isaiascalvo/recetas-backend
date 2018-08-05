var mongoose = require('mongoose');
var router = require('express').Router();
var Image = mongoose.model('image');


//Alta de Imagenes
router.post('/', (req, res, next) => {
    let name = req.body.name;
    let url = req.body.url;

    var image = new Image({
        name: name,
        url : url,
    });

    image.save().then(function (us) {
        res.send("Image had been posted \n" + image);
    }, function (err) {
        console.log(String(err));
        res.send("The image has not been registered correctly");
    })
});


//Listar todas las Imagenes
router.get('/', (req, res, next) => {
    
    Image.find({})
        .then(imagens => {
            if (!imagens) { return res.sendStatus(401); }
            console.log(imagens);
            return res.json({ 'imagens': imagens })
        })
});

module.exports = router;