var mongoose = require('mongoose');
var router = require('express').Router();
var Votation = mongoose.model('votation');
var Recipe = mongoose.model('recipe');
const jwt = require('jsonwebtoken');

//Voto de un usuario a una receta 
router.post('/', (req, res, next) => {
    //Verificar si el usuario que vota, no lo hizo ya anteriormente
    //si nunca votó, entonces creo la votación
    // pero si ya había votado, actualizo la votación con el nuevo puntaje
    //esto es así porque un usuario puede querer cambiar la votación antes realizada
    let token = jwt.decode(req.headers.authorization);
    if (token !== null && token.userID !== null)
    {
        if( Date.now() > token.exp*1000) {
            throw new Error('Token has expired');
        }
        if( Date.now() < token.nbf*1000) {
            throw new Error('Token not yet valid');
        }
        Votation.findOne({user: token.userID, recipe: req.body.recipe})
        .then(votation => {
            if (votation==null) 
            {
                console.log('\n\nnueva\n\n');
                let points = req.body.points;
                let user = token.userID;
                let recipe = req.body.recipe;
        
                var votation = new Votation({
                    points: points,
                    user: user,
                    recipe: recipe,
                });
        
                votation.save()
                .then( votation => {
                    Recipe.findOneAndUpdate({ _id: req.body.recipe }, {$inc:{votes: 1, punctuation: req.body.points} }, { new: true, returnNewDocument: true }, function (recipe) {
                        if (recipe)
                        {
                            res.json({'recipe': recipe});
                        }           
                    })
                })           
            }
            else
            {
                console.log('\n\nact\n\n');
                let id= votation._id;
                let dif= req.body.points - votation.points;
                console.log(req.body.points, ' - ',votation.points,' = ',dif);
                Votation.findOneAndUpdate({ _id: id }, {points: req.body.points})
                .then(votation2 => {
                    if (votation2)
                    {
                        Recipe.findOneAndUpdate({ _id: req.body.recipe }, {$inc:{punctuation: dif} }, { new: true, returnNewDocument: true}, function (recipe2) {
                            if (recipe2)
                            {
                                res.json({'recipe': recipe2});
                            }                        
                        });
                    } 
                })
            }
        })
    }
    else 
    {
        res.status(403).send("Error. You must login.");
    }
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

// saber si un usuario votó una receta específica
router.get('/vote/:recipe', (req, res, next) => {
    let recipe = req.params.recipe;
    let token = jwt.decode(req.headers.authorization);
    if (token !== null && token.userID !== null)
    {
        if( Date.now() > token.exp*1000) {
            throw new Error('Token has expired');
        }
        if( Date.now() < token.nbf*1000) {
            throw new Error('Token not yet valid');
        }
        Votation.findOne({recipe: recipe, user: token.userID})
        .then(votation => {
            if (!votation) { return res.json({ 'votation': null })}
            return res.json({ 'votation': votation })
        })
    }
    else
    {
        res.status(403).send("Error. You must login.");
    }
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