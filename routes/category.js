var mongoose = require('mongoose');
var router = require('express').Router();
var Category = mongoose.model('category');
var Recipe = mongoose.model('recipe');

//Alta de Categorías
router.post('/', (req, res, next) => {
    let name = req.body.name;
    let description = req.body.description;

    var category = new Category({
        name: name,
        description: description,
    });

    category.save().then(function(us){
        res.send("Category had been posted \n" + category);
    }, function(err){
        console.log(String(err));
        res.send("The category has not been registered correctly");
    })
});

//Buscar una Categoría por id
router.get('/:id', (req, res, next) => {
    let id = req.params.id;
    Category.findById(id)
        .then(category => {
            if (!category) { return res.sendStatus(401); }
            return res.json({ 'category': category })
        })
});

//Buscar una Categoría por nombre
//no creo que se use, pero lo dejo por las dudas
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
    Category.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true }, function (err, category) {
        if (err)
            res.send(err);
        res.json(category);
    });
    //res.send("Category updated");
});

//Baja de Categoría indicando el id
router.delete('/:id', (req, res, next) => {
    Recipe.find({category:req.params.id},(err, recipes) => {
        if(!recipes)
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
});

module.exports = router;