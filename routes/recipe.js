var mongoose = require('mongoose');
var router = require('express').Router();
var Recipe = mongoose.model('recipe');

//Alta de Recetas
router.post('/', (req, res, next) => {
    let name = req.body.name;
    let time = req.body.time;
    let description = req.body.description;
    let items = req.body.items;
    let preparation = req.body.preparation;
    let votes = 0;
    let punctuation = 0;
    let creator= req.body.creator;
    let category= req.body.category;

    //Acomodar esto para los pasos y las categorías
    /* 
    req.body.forEach(element,index => {
        
    });
    */

    var recipe = new Recipe({
        name: name,
        time: time,
        description: description,
        items: items,
        preparation : preparation,
        votes: votes,
        punctuation: punctuation,
        creator: creator,
        category: category,
    });
    recipe.save().then(function(us){
        res.send("Recipe had been posted \n" + recipe);
    }, function(err){
        console.log(String(err));
        res.send("The recipe has not been registered correctly");
    })
});

//Listar todos las recetas
//no se si andará
router.get('/', (req, res, next) => {
    Recipe.find({})
        .populate( 'creator' )
        .populate( 'category' )
        .populate( { path: 'items', populate: { path: 'ingredient'}})
            .exec(function (err, recipes) {
                return res.json({ 'recipes': recipes })
            })                
    .catch(next);
   
});

//Listar las recetas de un creador
router.get('/MyRecipes/:creator', (req, res, next) => { 
    let id = req.params.creator;
    Recipe.find({creator:id})
        .populate( 'creator' )
        .populate( 'category' )
        .populate( { path: 'items', populate: { path: 'ingredient'}})

            .exec(function (err, recipes) {
                return res.json({ 'recipes': recipes })
            })                
    .catch(next);
   
});

//Buscar Recetas por nombre
//falta hacer
router.get('/byName/:name', (req, res, next) => {
    Recipe.findOne({name:req.params.name})
    .populate( 'creator' )
    .populate( 'category' )
    .populate( { path: 'items', populate: { path: 'ingredient'}})
    .then(recipe => {
        if (!recipe) { return res.sendStatus(401); }
        return res.json({ 'recipe': recipe })
    })
});

//Buscar Recetas por categoría
//falta hacer
router.get('/byCategory/:category', (req, res, next) => {
    Category.findOne({name:req.params.category})
    .then(category => {
        if (!category) 
        { 
            return res.sendStatus(401); 
        }
        else
        {
            let cat=category._id;
            Recipe.find({category:cat})
                .populate( 'creator' )
                .populate( 'category' )
                .populate( { path: 'items', populate: { path: 'ingredient'}})
                .then(recipes => {
                    return res.json({ 'recipes': recipes })
                })
        }
    })
});

//Listar una receta
router.get('/:id', (req, res, next) => {
    let id = req.params.id;
    Recipe.findById(id)
        .populate( 'user' )
        .populate( 'category' )
        .populate( { path: 'items', populate: { path: 'ingredient'}})
        .exec(function (err, recipe) {
            console.log(recipe);
            return res.json({ 'recipe': recipe })
        })
    .catch(next);
});

//Modificar una receta
//falta acomodar
router.put('/:id', (req, res, next) => {
    Recipe.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true }, function (err, recipe) {
        if (err)
            res.send(err);
        res.json(recipe);
    });
    //res.send("Recipe updated");

});

//Baja de Receta indicando el id
router.delete('/:id', (req, res, next) => {
    Recipe.findByIdAndRemove(req.params.id, (err, recipe) => {
        let response = {
            message: "Recipe successfully deleted",
            id: recipe._id
        };
        res.status(200).send(response);
    });
});

module.exports = router;
