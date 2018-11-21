var mongoose = require('mongoose');
var router = require('express').Router();
var Recipe = mongoose.model('recipe');
var Report = mongoose.model('report');
var ItemRecipe = mongoose.model('itemRecipe');
var Category = mongoose.model('category');
var Ingredient = mongoose.model('ingredient');
const jwt = require('jsonwebtoken');

//Alta de Recetas
router.post('/', (req, res, next) => {
    let token = jwt.decode(req.headers.authorization);
    if (token !== null && token.userID !== null)
    {
        if( Date.now() > token.exp*1000) {
            throw new Error('Token has expired');
        }
        if( Date.now() < token.nbf*1000) {
            throw new Error('Token not yet valid');
        }

        let name = req.body.name;
        let time = req.body.time;
        let description = req.body.description;
        let items = new Array();// = req.body.items;
        let preparation = req.body.preparation;
        let votes = 0;
        let punctuation = 0;
        let creator= req.body.creator;
        let category= req.body.category;

        removeElement(preparation, " ");
        req.body.items.forEach((i,index) => {
            if(i==" ")
            {
                req.body.items.splice(index,1);
                req.body.cants2.splice(index,1);
            }            
        });
        
        var recipe = new Recipe({
            name: name,
            time: time,
            description: description,
            preparation : preparation,
            votes: votes,
            punctuation: punctuation,
            creator: creator,
            category: category,
        });
        recipe.save().then(res =>{
            req.body.items.forEach((it,index) => {
                Ingredient.find({name:it})
                .then(ingredient => {
                    if (ingredient._id==null) 
                    { 
                        var ingre = new Ingredient({
                            name: it,
                        });
                        ingre.save()
                        .then(us =>{
                            var itemRecipe = new ItemRecipe({
                                quantity: req.body.cants2[index],
                                ingredient: ingre._id,
                                recipe: recipe,
                            });
                            itemRecipe.save()
                            .then(ig =>{
                                Recipe.findOneAndUpdate(
                                    {
                                        _id: recipe._id
                                    }, {
                                    $addToSet : {
                                        items:itemRecipe._id
                                    }
                                    }
                                ).catch(next);
                            }).catch(next);
                        }).catch(next);
                    }
                    else
                    {
                        var itemRecipe = new ItemRecipe({
                            quantity: req.body.cants2[index],
                            ingredient:ingredient._id,
                            recipe: recipe,
                        });
                        itemRecipe.save()
                        .then(ig =>{
                            Recipe.findOneAndUpdate(
                                {
                                    _id: recipe._id
                                }, {
                                $addToSet : {
                                    items:itemRecipe._id
                                }
                                }
                            ).catch(next);
                        }).catch(next);
                    }
                }).catch(next);
            });
        }, function(err){
            res.send("The recipe has not been registered correctly");
        }).catch(next);
        
        Recipe.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true }, function (err, recipe) {
            if (err)
                res.send(err);
            res.json(recipe);
        });
    } else {
        res.status(403).send("Error. You must  login.");
    }
});

//Listar todos las recetas
router.get('/', (req, res, next) => {
    Recipe.find({})
        .populate( 'creator' )
        .populate( 'category' )
        .populate( { path: 'items', populate: { path: 'ingredient'}})
        .then(recipes => {
            if(!recipes) { return res.sendStatus(401); }
            return res.json({ 'recipes': recipes });
        })
        .catch(next);
   
});

//Listar las recetas de un creador
router.get('/MyRecipes', (req, res, next) => { 

    let token = jwt.decode(req.headers.authorization);
    if (token !== null && token.userID !== null)
    {
        if( Date.now() > token.exp*1000) {
            throw new Error('Token has expired');
        }
        if( Date.now() < token.nbf*1000) {
            throw new Error('Token not yet valid');
        }

        Recipe.find({creator:token.userID})
        .populate( 'creator' )
        .populate( 'category' )
        .populate( { path: 'items', populate: { path: 'ingredient'}})
        .then(recipes => {
            return res.json({ 'recipes': recipes })
        })   
    }    
    else 
    {
        res.status(403).send("Error. You must login.");
    }           
});

//Contar las recetas de un creador
router.get('/CantRecipes/:creator', (req, res, next) => { 
    let creator = req.params.creator;
    Recipe.find({creator:creator}).count()
    .then(count => {
        return res.json({ 'count': count })
    });
});

//Buscar Recetas por nombre
//falta hacer
router.get('/byName/:name', (req, res, next) => {
    Recipe.find({name:req.params.name})
    .populate( 'creator' )
    .populate( 'category' )
    .populate( { path: 'items', populate: { path: 'ingredient'}})
    .then(recipes => {
        if (!recipes) { return res.sendStatus(401); }
        return res.json({ 'recipes': recipes })
    })
});

//Buscar Recetas por nombre de categoría
//falta hacer
router.get('/byCategory/:category', (req, res, next) => {
    Category.findOne({name:req.params.category})
    .then(category => {
        if (!category) 
        { 
            return res.sendStatus(401);//la categoría no se encontró 
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

//Buscar Recetas por ID de categoría
router.get('/byCategoryID/:categoryID', (req, res, next) => {
    Recipe.find({category:req.params.categoryID})
        .populate( 'creator' )
        .populate( 'category' )
        .populate( { path: 'items', populate: { path: 'ingredient'}})
        .then(recipes => {
            return res.json({ 'recipes': recipes })
        })
});

//Listar una receta
router.get('/:id', (req, res, next) => {
    let id = req.params.id;
    Recipe.findById(id)
        .populate( 'creator' )
        .populate( 'category' )
        .populate( { path: 'items', populate: { path: 'ingredient'}})
        .exec(function (err, recipe) {
            return res.json({ 'recipe': recipe })
        })
});

//Modificar una receta
router.put('/:id', (req, res, next) => {

    let id = req.params.id;
    let token = jwt.decode(req.headers.authorization);
    if (token !== null && token.userID !== null)
    {
        if( Date.now() > token.exp*1000) {
            throw new Error('Token has expired');
        }
        if( Date.now() < token.nbf*1000) {
            throw new Error('Token not yet valid');
        }

        removeElement(req.body.preparation, " ");
        req.body.items.forEach((i,index) => {
            if(i==" ")
            {
                req.body.items.splice(index,1);
                req.body.cants2.splice(index,1);
            }            
        });

        let ingredientes =  req.body.items;
        req.body.items=new Array();

        Recipe.findById(id).then(function(rec){
            if(rec.creator == token.userID)
            {
                Recipe.findOneAndUpdate({ _id: id }, req.body, { new: true }, function (err, recipe) {
                    if (err)
                        res.send(err);
                    res.json(recipe);
                }).catch(next);
                ingredientes.forEach(function(it,index) {
                    Ingredient.find({name:it})
                    .then(function(ingredient){
                        if (ingredient.length===0) 
                        { 
                            var ingre = new Ingredient({
                                name: it,
                            });
                            ingre.save()
                            .then(function(){
                                var itemRecipe = new ItemRecipe({
                                    quantity: req.body.cants2[index],
                                    ingredient: ingre._id,
                                    recipe: id,
                                });
                                itemRecipe.save()
                                .then(function(){
                                    Recipe.findOneAndUpdate(
                                        {
                                            _id: req.params.id
                                        }, 
                                        {
                                            $addToSet : {
                                                items:itemRecipe._id
                                            }
                                        },
                                        { 
                                            returnNewDocument:true, 
                                        }
                                        ).catch(next);
                                }).catch(next);
                            }).catch(next);
                        }
                        else
                        {
                            ItemRecipe.findOne({ingredient:ingredient[0]._id, recipe: id}).then(function(ite) {
                                if(ite.length===0){
                                    var itemRecipe = new ItemRecipe({
                                        quantity: req.body.cants2[index],
                                        ingredient:ingredient[0]._id,
                                        recipe: id,
                                    });
                                    itemRecipe.save()
                                    .then(function(itemRecipe){
                                        Recipe.findOneAndUpdate(
                                            {
                                                _id: id
                                            }, {
                                            $addToSet : {
                                                items:itemRecipe[0]._id
                                                }
                                            },
                                            { 
                                                new: true,
                                                returnNewDocument:true, 
                                            }
                                        ).catch(next);
                                    }).catch(next);
                                }
                                else{         
                                    ItemRecipe.findOneAndUpdate({_id:ite._id},{quantity:req.body.cants2[index]},{new: true, returnNewDocument: true,})
                                    .then(itemRecipe => {
                                        Recipe.findOneAndUpdate(
                                            {
                                                _id: id
                                            }, {
                                            $addToSet : {
                                                items:itemRecipe._id
                                                }
                                            },
                                            { 
                                                new: true,
                                                returnNewDocument:true, 
                                            }                                
                                        ).catch(next);
                                    })
                                    .catch(next);                        
                                }
                            })
                        }
                    }).catch(next);
                });
            }
            else
            {
                res.status(403).send("Error. You must be the creator of the recipe to edit it.");
            }
        })        
    }
    else 
    {
        res.status(403).send("Error. You must login.");
    }
});

//Baja de Receta indicando el id
router.delete('/:id', (req, res, next) => {
    let token = jwt.decode(req.headers.authorization);
    if (token !== null && token.userID !== null)
    {
        if( Date.now() > token.exp*1000) {
            throw new Error('Token has expired');
        }
        if( Date.now() < token.nbf*1000) {
            throw new Error('Token not yet valid');
        }
        //borra los items de la receta
        ItemRecipe.deleteMany({recipe:req.params.id}, (err, itemRecipe) => {
            if(err)
            {
                let response = {
                    message: "Error. The Recipe has not been deleted because there was an error when deleting their items.",
                    id: recipe._id
                };
                res.status(409).send(response);
            }
            else
            {
                Report.deleteMany({recipe:req.params.id}, (err,report) =>{
                    if(err)
                    {
                        let response = {
                            message: "Error. The Recipe has not been deleted because there was an error when deleting their reports",
                            id: recipe._id
                        };
                        res.status(409).send(response);
                    }
                    else
                    {
                        Recipe.findByIdAndRemove(req.params.id, (err, recipe) => {
                            let response = {
                                message: "Recipe successfully deleted",
                                id: recipe._id
                            };
                            res.status(200).send(response);
                        
                        });
                    }
                });            
            }
        });  
    }   
    else 
    {
        res.status(403).send("Error. You must login or be an administrator.");
    }   
});

function removeElement(array, elem) {
    array.forEach((ell,index) => {
        if (ell==elem) {
            // modifies array in place
            array.splice(index,1);
          }
    });
}

module.exports = router;
