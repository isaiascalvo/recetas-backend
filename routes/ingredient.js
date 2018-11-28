var mongoose = require('mongoose');
var router = require('express').Router();
var Ingredient = mongoose.model('ingredient');
var ItemRecipe = mongoose.model('itemRecipe');



//Alta de Ingredientes
router.post('/', (req, res, next) => {
    let name = req.body.name;

    var ingredient = new Ingredient({
        name: name,
    });

    ingredient.save().then(function(us){
        res.send("Ingredient had been posted \n" + ingredient);
    }, function(err){
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

//Buscar un Ingrediente por nombre
router.get('/byName/:name', (req, res, next) => {
    Ingredient.findOne({name:req.params.name})
        .then(ingredient => {
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
});

//Baja de Ingrediente indicando el id
router.delete('/:id', (req, res, next) => {
    ItemRecipe.find({ingredient:req.params.id},(err, itemRecipes) => {
        if(!itemRecipes)
        {
            Ingredient.findByIdAndRemove(req.params.id, (err, ingredient) => {
                let response = {
                    message: "Ingredient successfully deleted",
                    id: ingredient._id,
                };
                res.status(200).send(response);
            });
        }
        else
        {
            let response = {
                message: "Error. The Item has not been deleted because there are many items that contain it.",
            };
            res.status(409).send(response);
        }
    })
    
});

module.exports = router;