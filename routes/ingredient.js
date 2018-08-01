var mongoose = require('mongoose');
var router = require('express').Router();
var Ingredient = mongoose.model('ingredient');

//Alta de Ingredientes
router.post('/', (req, res, next) => {
    let name = req.body.name;

    var ingredient = new Ingredient({
        name: name,
    });

    ingredient.save().then(function(us){
        res.send("Ingredient had been posted \n" + ingredient);
    }, function(err){
        console.log(String(err));
        res.send("The Ingredient has not been registered correctly");
    })
});

//Listar todos los ingredientes
router.get('/', (req, res, next) => {
    Ingredient.find({})
        .then(ingredients => {
            if (!ingredients) { return res.sendStatus(401); }
            return res.json({ 'ingredients': ingredients })
        })
});

//Buscar un Ingrediente por id
router.get('/:id', (req, res, next) => {
    let id = req.params.id;
    Ingredient.findById(id)
        .then(ingredient => {
            if (!ingredient) { return res.sendStatus(401); }
            return res.json({ 'ingredient': ingredient })
        })
});

//Buscar una Ingrediente por nombre
router.get('/byName/:name', (req, res, next) => {
    let name = req.params.name;
    Ingredient.findOne(name)
        .then(ingredient => {
            if (!ingredient) { return res.sendStatus(401); }
            return res.json({ 'ingredient': ingredient })
        })
});


//Modificar Ingrediente
router.put('/:id', (req, res, next) => {
    Ingredient.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true }, function (err, ingredient) {
        if (err)
            res.send(err);
        res.json(ingredient);
    });
    //res.send("Ingredient updated");
});

//Baja de Ingrediente indicando el id
router.delete('/:id', (req, res, next) => {
    Ingredient.findByIdAndRemove(req.params.id, (err, ingredient) => {
        let response = {
            message: "Ingredient successfully deleted",
            id: ingredient._id,
        };
        res.status(200).send(response);
    });
});

module.exports = router;