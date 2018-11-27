var mongoose = require('mongoose');
var router = require('express').Router();
var ItemRecipe = mongoose.model('itemRecipe');

//Alta de Recetas
router.post('/', (req, res, next) => {
    let quantity = req.body.quantity;
    let ingredient = req.body.ingredient;
    let recipe = req.body.recipe;

    var itemRecipe = new ItemRecipe({
        quantity: quantity,
        ingredient: ingredient,
        recipe: recipe,
    });

    itemRecipe.save().then(function(us){
        res.send("ItemRecipe had been posted \n" + itemRecipe);
    }, function(err){
        res.send("The itemRecipe has not been registered correctly");
    })
});

//Listar todas los ingredientes de una receta y su cantidad
//arreglar y no se si se usará
router.get('/otro/:id', (req, res, next) => {
    ItemRecipe.find({recipe:req.params.id})
        .populate( 'ingredient' )
        .populate( 'recipe' )
        .then(itemRecipes => {
            if (!itemRecipes) { return res.sendStatus(401); }
            return res.json({ 'itemRecipes': itemRecipes})
        })
        .catch(next);   
});

//Listar todos los itemRecipes
router.get('/', (req, res, next) => {
    ItemRecipe.find({})
        .then(itemRecipes => {
            if (!itemRecipes) { return res.sendStatus(401); }
            return res.json({ 'itemRecipes': itemRecipes })
        })
});

//Listar un itemRecipes
router.get('/:id', (req, res, next) => {
    let id = req.params.id;
    ItemRecipe.findById(id)
        .then(itemRecipe => {
            if (!itemRecipe) { return res.sendStatus(401); }
            return res.json({ 'itemRecipe': itemRecipe })
        })
});


//Modificar itemRecipes
router.put('/:id', (req, res, next) => {
    ItemRecipe.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true }, function (err, itemRecipe) {
        if (err)
            res.send(err);
        res.json(itemRecipe);
    });
    //res.send("ItemRecipes updated");
});

//Baja de itemRecipes indicando el id
router.delete('/:id', (req, res, next) => {
    ItemRecipe.findByIdAndRemove(req.params.id, (err, itemRecipe) => {
        let response = {
            message: "ItemRecipe successfully deleted",
            id: itemRecipe._id,
        };
        res.status(200).send(response);
    });
});

module.exports = router;