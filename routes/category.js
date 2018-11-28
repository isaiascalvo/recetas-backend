var mongoose = require('mongoose');
var router = require('express').Router();
var Category = mongoose.model('category');
var Recipe = mongoose.model('recipe');
const jwt = require('jsonwebtoken');

//Alta de Categorías
router.post('/', (req, res, next) => {
    let token = jwt.decode(req.headers.authorization);
    if (token !== null && token.userType === 1)
    {
        if( Date.now() > token.exp*1000) {
            throw new Error('Token has expired');
        }
        if( Date.now() < token.nbf*1000) {
            throw new Error('Token not yet valid');
        }
        let name = req.body.name;
        let description = req.body.description;

        var category = new Category({
            name: name,
            description: description,
        });

        category.save().then(function(){
            res.send("Category had been posted \n" + category);
        }, function(err){
            res.send("The category has not been registered correctly");
        })
    }
    else
    {
        res.status(403).send("Error. You must be an administrator.");
    }
});

//Listar todas las Categorías
router.get('/', (req, res, next) => {
    Category.find({})
        .then(categories => {
            if (!categories) { return res.sendStatus(401); }
            return res.json({ 'categories': categories })
        })
});

//Buscar una Categoría por id
router.get('/:id', (req, res, next) => {
    let id = req.params.id;
    let token = jwt.decode(req.headers.authorization);
    if (token !== null && token.userType === 1)
    {
        if( Date.now() > token.exp*1000) {
            throw new Error('Token has expired');
        }
        if( Date.now() < token.nbf*1000) {
            throw new Error('Token not yet valid');
        }
        Category.findById(id)
        .then(category => {
            if (!category) { return res.sendStatus(401); }
            return res.json({ 'category': category })
        })
    }
    else
    {
        res.status(403).send("Error. You must be an administrator.");
    }
});

//Buscar una Categoría por nombre
router.get('/byName/:name', (req, res, next) => {
    let name = req.params.name;
    Category.findOne(name)
        .then(category => {
            if (!category) { return res.sendStatus(401); }
            return res.json({ 'category': category })
        })
});


//Modificar Categoría
router.put('/:id', (req, res, next) => {
    let token = jwt.decode(req.headers.authorization);
    if (token !== null && token.userType === 1)
    {
        if( Date.now() > token.exp*1000) {
            throw new Error('Token has expired');
        }
        if( Date.now() < token.nbf*1000) {
            throw new Error('Token not yet valid');
        }
        Category.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true }, function (err, category) {
            if (err)
                res.send(err);
            res.json(category);
        });
    }   
    else
    {
        res.status(403).send("Error. You must be an administrator.");
    }
});

//Baja de Categoría indicando el id
router.delete('/:id', (req, res, next) => {
    let token = jwt.decode(req.headers.authorization);
    if (token !== null && token.userType === 1)
    {
        if( Date.now() > token.exp*1000) {
            throw new Error('Token has expired');
        }
        if( Date.now() < token.nbf*1000) {
            throw new Error('Token not yet valid');
        }
        Recipe.find({category:req.params.id},(err, recipes) => {
            if(recipes.length === 0)
            {
                Category.findByIdAndRemove(req.params.id, (err, category) => {
                    let response = {
                        message: "Category successfully deleted",
                        id: category._id,
                    };
                    res.status(200).send(response);
                });
            }
            else
            {
                let response = {
                    message: "Error. The Category has not been removed because there are many Recipes belong to it.",
                };
                res.status(409).send(response);
            }
        })
    }
    else
    {
        res.status(403).send("Error. You must be an administrator.");
    }
});

module.exports = router;