var mongoose = require('mongoose');
var router = require('express').Router();
var Recipe = mongoose.model('recipe');
var ItemRecipe = mongoose.model('itemRecipe');
var Category = mongoose.model('category');
var Ingredient = mongoose.model('ingredient');


//Alta de Recetas
router.post('/', (req, res, next) => {
    let name = req.body.name;
    let time = req.body.time;
    let description = req.body.description;
    let items = new Array();// = req.body.items;
    let preparation = req.body.preparation;
    let votes = 0;
    let punctuation = 0;
    let creator= req.body.creator;
    let category= req.body.category;
    /*
    let category= [];

    let cates;

    Category.find({})
        .then(categories => {
           this.cates=categories;
        })
        */
    //Acomodar esto para los pasos y las categorías
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
        //items: items,
        preparation : preparation,
        votes: votes,
        punctuation: punctuation,
        creator: creator,
        category: category,
    });
    recipe.save().then(res =>{
        console.log(req.body.items);
        console.log(recipe._id);
        req.body.items.forEach((it,index) => {
            console.log('algo');
            Ingredient.find({name:it})
            .then(ingredient => {
                if (ingredient._id==null) 
                { 
                    var ingre = new Ingredient({
                        name: it,
                    });
                    ingre.save()
                    .then(us =>{
                        console.log('MOSTRANDO INGRE1');
                        console.log(ingre._id);
                        var itemRecipe = new ItemRecipe({
                            quantity: req.body.cants2[index],
                            ingredient: ingre._id,
                            recipe: recipe,
                        });
                        itemRecipe.save()
                        .then(ig =>{
                            console.log(itemRecipe._id);
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
                    console.log('MOSTRANDO INGRE2');
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

        //Recipe.findOneAndUpdate({ _id: recipe._id }, {items:items}, { new: true }, function (err, recipe) {});
        //return res.json({ 'recipe': recipe });
        

        //res.send("Recipe had been posted \n" + recipe);
    }, function(err){
        console.log(String(err));
        res.send("The recipe has not been registered correctly");
    }).catch(next);
    
    Recipe.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true }, function (err, recipe) {
        if (err)
            res.send(err);
        res.json(recipe);
    });
});

//Listar todos las recetas
//no se si andará
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
router.get('/MyRecipes/:creator', (req, res, next) => { 
    let id = req.params.creator;
    Recipe.find({creator:id})
        .populate( 'creator' )
        .populate( 'category' )
        .populate( { path: 'items', populate: { path: 'ingredient'}})
        .then(recipes => {
            return res.json({ 'recipes': recipes })
        })                  
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
            console.log(recipe);
            return res.json({ 'recipe': recipe })
        })
});

//Modificar una receta
//falta acomodar
router.put('/:id', (req, res, next) => {
    console.log("\nActualizando...");
    let id = req.params.id;

    removeElement(req.body.preparation, " ");
    req.body.items.forEach((i,index) => {
        if(i==" ")
        {
            req.body.items.splice(index,1);
            req.body.cants2.splice(index,1);
        }            
    });

    let ingredientes =  req.body.items;
    console.log("\ningredientes",ingredientes);
    req.body.items=new Array();
    console.log("\nboddddy",req.body);
    
    // req.body.items = ingredientes;          
    Recipe.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true }, function (err, recipe) {
            if (err)
                res.send(err);
            res.json(recipe);
        }).catch(next);
    
    //req.body.items = ingredientes;
    
    //console.log(req.body.items);
    //console.log(req.params.id);
    // Necesito ejecutar luego de este foreach la actualización de las recetas
    console.log("ingredientyes",ingredientes);
    ingredientes.forEach(function(it,index) {
        Ingredient.find({name:it})
        .then(function(ingredient){
            if (ingredient.length===0) 
            { 
                console.log('\n',ingredient);
                console.log('undefineeddd');
                var ingre = new Ingredient({
                    name: it,
                });
                ingre.save()
                .then(function(){
                    console.log('MOSTRANDO INGRE1');
                    console.log(ingre._id);
                    var itemRecipe = new ItemRecipe({
                        quantity: req.body.cants2[index],
                        ingredient: ingre._id,
                        recipe: id,
                    });
                    itemRecipe.save()
                    .then(function(){
                        console.log(itemRecipe._id);
                        //ingredientes.push(itemRecipe._id);
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
                console.log('\n',ingredient);
                console.log('\n',ingredient[0]._id);
                console.log('defineeeddd');
                ItemRecipe.findOne({ingredient:ingredient[0]._id, recipe: id}).then(function(ite) {
                    if(ite.length===0){
                        console.log('\nitemrecipe no encontrado');   
                        var itemRecipe = new ItemRecipe({
                            quantity: req.body.cants2[index],
                            ingredient:ingredient[0]._id,
                            recipe: id,
                        });
                        itemRecipe.save()
                        .then(function(itemRecipe){
                            // ingredientes.push(itemRecipe._id);                           
                            Recipe.findOneAndUpdate(
                                {
                                    _id: id
                                }, {
                                $addToSet : {
                                    items:itemRecipe[0]._id
                                    }
                                },
                                { 
                                    returnNewDocument:true, 
                                }
                            ).catch(next);
                        }).catch(next);
                    }
                    else{         
                        console.log('\nitemrecipe encontrado');  
                        console.log(ite._id);   
                        console.log(ite);  
                        ItemRecipe.findOneAndUpdate({_id:ite._id},{quantity:req.body.cants2[index]},{new: true, returnNewDocument: true,})
                        .then(itemRecipe => {
                            console.log(itemRecipe);
                            Recipe.findOneAndUpdate(
                                {
                                    _id: id
                                }, {
                                $addToSet : {
                                    items:itemRecipe._id
                                    }
                                },
                                { 
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
});

    
    

//Baja de Receta indicando el id
router.delete('/:id', (req, res, next) => {
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
            Recipe.findByIdAndRemove(req.params.id, (err, recipe) => {
                let response = {
                    message: "Recipe successfully deleted",
                    id: recipe._id
                };
                res.status(200).send(response);
            });
        }
    });        
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
