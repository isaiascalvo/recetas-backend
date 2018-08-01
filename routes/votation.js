var mongoose = require('mongoose');
var router = require('express').Router();
var Votation = mongoose.model('votation');
var Recipe = mongoose.model('recipe');


//Voto de un usuario a una receta 
router.post('/', (req, res, next) => {
    //Verificar si el usuario que vota, no lo hizo ya anteriormente
    //si nunca votó, entonces creo la votación
    // pero si ya había votado, actualizo la votación con el nuevo puntaje
    //esto es así porque un usuario puede querer cambiar la votación antes realizada
    Votation.findOne({user: req.body.user, recipe: req.body.recipe})
        .then(votation => {
            if (votation==null) 
            {
                let points = req.body.points;
                let user = req.body.user;
                let recipe = req.body.recipe;
        
                var votation = new Votation({
                    points: points,
                    user: user,
                    recipe: recipe,
                });
        
                votation.save().then(function(us){
                    res.send("Votation had been posted \n" + votation);
                }, function(err){
                    console.log(String(err));
                    res.send("The votation has not been registered correctly");
                })
        
                //No se si anda
                Recipe.findOneAndUpdate({ _id: recipe }, {$inc:{votes: 1}, $inc:{punctuation: punctuation} }, { new: true }, function (err, recipe) {
                    if (err)
                        res.send(err);
                    res.json(recipe);
                });
            }
            else
            {
                let id= votation._id;
                let dif= req.body.points - votation.points;
                Votation.findOneAndUpdate({ _id: id }, {points: req.body.points}, { new: true }, function (err, votation2) {
                    if (err)
                        res.send(err);
                    res.json(votation2);
                });
                //No se si anda
                Recipe.findOneAndUpdate({ _id: recipe }, {$inc:{punctuation: dif} }, { new: true }, function (err, recipe) {
                    if (err)
                        res.send(err);
                    res.json(recipe);
                });
            }
            //return res.json({ 'votation': votation })
        })
        
});

//Listar todas las votaciones
// no se si se usará
router.get('/', (req, res, next) => {
    Votation.find({})
        .then(votations => {
            if (!votations) { return res.sendStatus(401); }
            return res.json({ 'votations': votations })
        })
});

//Listar una votación
// no se si se usará
router.get('/:id', (req, res, next) => {
    let id = req.params.id;
    Votation.findById(id)
        .then(votation => {
            if (!votation) { return res.sendStatus(401); }
            return res.json({ 'votation': votation })
        })
});


//Modificar votación
//no se si usará
router.put('/:id', (req, res, next) => {
    Votation.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true }, function (err, votation) {
        if (err)
            res.send(err);
        res.json(votation);
    });
    //res.send("Votation updated");
});

//Baja de Votación indicando el id 
//no se si usará
router.delete('/:id', (req, res, next) => {
    Votation.findByIdAndRemove(req.params.id, (err, votation) => {
        let response = {
            message: "Votation successfully deleted",
            id: votation._id,
        };
        res.status(200).send(response);
    });
});

module.exports = router;