var mongoose = require('mongoose');
var router = require('express').Router();
var Report = mongoose.model('report');
const jwt = require('jsonwebtoken');

//Alta de Denuncia
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
        let user = req.body.user;
        let recipe = req.body.recipe;
        let description = req.body.description;

        var report = new Report({
            user: user,
            recipe: recipe,
            description: description,
        });

        report.save().then(function(){
            res.send("Report had been posted \n" + report);
        }, function(err){
            res.send("The report has not been registered correctly");
        })
    }   
    else 
    {
        res.status(403).send("Error. You must login.");
    }
});

//Listar todas las Denuncias
router.get('/', (req, res, next) => {
    let token = jwt.decode(req.headers.authorization);
    if (token !== null && token.userID !== null)
    {
        if( Date.now() > token.exp*1000) {
            throw new Error('Token has expired');
        }
        if( Date.now() < token.nbf*1000) {
            throw new Error('Token not yet valid');
        }
        Report.aggregate(
            [
                { $group : {_id: "$recipe", recipe: {$first: '$recipe'}, count: { $sum: 1 } } },
                { $sort : { count: -1 }},
                {
                    $lookup: {
                        from: "recipes",
                        localField: "recipe",
                        foreignField: "_id",
                        as: "recipe"
                    }
                },
                {$unwind: "$recipe"},
                {
                    $lookup: {
                        from: "users",
                        localField: "recipe.creator",
                        foreignField: "_id",
                        as: "recipe.creator"
                    }
                }
            ]
        )
        .then(reports => {
            if (!reports) { return res.sendStatus(401); }
            return res.json({ 'reports': reports })
        })
    }   
    else 
    {
        res.status(403).send("Error. You must be an administrator.");
    }
});


//Listar todas las Denuncias
router.get('/GetReportsByPage/:skip/:cant', (req, res, next) => {
    let skip = parseInt(req.params.skip);
    let cant = parseInt(req.params.cant);
    let token = jwt.decode(req.headers.authorization);
    if (token !== null && token.userID !== null)
    {
        if( Date.now() > token.exp*1000) {
            throw new Error('Token has expired');
        }
        if( Date.now() < token.nbf*1000) {
            throw new Error('Token not yet valid');
        }
        Report.aggregate(
            [
                { $group : {_id: "$recipe", recipe: {$first: '$recipe'}, count: { $sum: 1 } } },
                { $sort : { count: -1 }},
                {
                    $lookup: {
                        from: "recipes",
                        localField: "recipe",
                        foreignField: "_id",
                        as: "recipe"
                    }
                },
                {$unwind: "$recipe"},
                {
                    $lookup: {
                        from: "users",
                        localField: "recipe.creator",
                        foreignField: "_id",
                        as: "recipe.creator"
                    }
                }
            ]
        )
        .skip(skip)
        .limit(cant)
        .then(reports => {
            if (!reports) { return res.sendStatus(401); }
            return res.json({ 'reports': reports })
        })
    }   
    else 
    {
        res.status(403).send("Error. You must be an administrator.");
    }
});

//Listar todas las Denuncias de una receta
router.get('/RecipeReports/:recipe', (req, res, next) => {
    let token = jwt.decode(req.headers.authorization);
    if (token !== null && token.userID !== null)
    {
        if( Date.now() > token.exp*1000) {
            throw new Error('Token has expired');
        }
        if( Date.now() < token.nbf*1000) {
            throw new Error('Token not yet valid');
        }
        let id = req.params.recipe;
        Report.find({recipe:id})
        .populate( 'user' )
        .populate( 'recipe' )
            .then(reports => {
                return res.json({ 'reports': reports })
            })
    }
    else
    {
        res.status(403).send("Error. You must login.");
    }
});

//Buscar una Denuncia por id
router.get('/:id', (req, res, next) => {
    let token = jwt.decode(req.headers.authorization);
    if (token !== null && token.userID !== null)
    {
        if( Date.now() > token.exp*1000) {
            throw new Error('Token has expired');
        }
        if( Date.now() < token.nbf*1000) {
            throw new Error('Token not yet valid');
        }
        let id = req.params.id;
        Report.findById(id)
            .then(report => {
                if (!report) { return res.sendStatus(401); }
                return res.json({ 'report': report })
            })
    }
    else
    {
        res.status(403).send("Error. You must login.");
    }
});

//Modificar Denuncia
router.put('/:id', (req, res, next) => {
    let token = jwt.decode(req.headers.authorization);
    if (token !== null && token.userID !== null)
    {
        if( Date.now() > token.exp*1000) {
            throw new Error('Token has expired');
        }
        if( Date.now() < token.nbf*1000) {
            throw new Error('Token not yet valid');
        }
        Report.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true }, function (err, report) {
            if (err)
                res.send(err);
            res.json(report);
        });
    }
    else
    {
        res.status(403).send("Error. You must login.");
    }
});

//Baja de Denuncia indicando el id
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
        Report.findByIdAndRemove(req.params.id, (err, report) => {
            let response = {
                message: "Report successfully deleted",
                id: report._id,
            };
            res.status(200).send(response);
        });
    }
    else
    {
        res.status(403).send("Error. You must login.");
    }
});

module.exports = router;