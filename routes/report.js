var mongoose = require('mongoose');
var router = require('express').Router();
var Report = mongoose.model('report');

//Alta de Denuncia
router.post('/', (req, res, next) => {

    let user = req.body.user;
    let recipe = req.body.recipe;
    let description = req.body.description;

    var report = new Report({
        user: user,
        recipe: recipe,
        description: description,
    });

    report.save().then(function(us){
        res.send("Report had been posted \n" + report);
    }, function(err){
        console.log(String(err));
        res.send("The report has not been registered correctly");
    })
});

//Listar todas las Denuncias
router.get('/', (req, res, next) => {
    Report.find({})
        .then(reports => {
            if (!reports) { return res.sendStatus(401); }
            return res.json({ 'reports': reports })
        })
});

//Listar todas las Denuncias de una receta
router.get('/RecipeReports/:recipe', (req, res, next) => {
    let id = req.params.recipe;
    Report.find({recipe:id})
    .populate( 'user' )
    .populate( 'recipe' )
        .then(reports => {
            return res.json({ 'reports': reports })
        })
});

//Buscar una Denuncia por id
router.get('/:id', (req, res, next) => {
    let id = req.params.id;
    Report.findById(id)
        .then(report => {
            if (!report) { return res.sendStatus(401); }
            return res.json({ 'report': report })
        })
});

//Modificar Denuncia
router.put('/:id', (req, res, next) => {
    Report.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true }, function (err, report) {
        if (err)
            res.send(err);
        res.json(report);
    });
});

//Baja de Denuncia indicando el id
router.delete('/:id', (req, res, next) => {
    Report.findByIdAndRemove(req.params.id, (err, report) => {
        let response = {
            message: "Report successfully deleted",
            id: report._id,
        };
        res.status(200).send(response);
    });
});

module.exports = router;