var mongoose = require('mongoose');
var router = require('express').Router();
var User = mongoose.model('user');
var Recipe = mongoose.model('recipe');


//Crear un usuario
router.post('/', (req, res, next) => {
    let name = req.body.name;
    let lastname = req.body.lastname;
    let username = req.body.username;
    let password = req.body.password;
    let password_confirmation = req.body.password_confirmation;
    let email = req.body.email;
    let favorites = req.body.favorites;
    let type;
    if(req.body.type) type = req.body.type;
    else type = 0;

    var user = new User({
        name: name,
        lastname: lastname,
        username: username,
        password: password,
        password_confirmation: password_confirmation,
        email: email,
        favorites: favorites, 
        type: type,
        
    });
    //Puede haber error desde acá
    user.save().then(function(us){
        res.json( user);
    }, function(err){
        console.log(String(err));
        res.send("The user has not been registered correctly");
    })
});

//Listar todos los usuario
router.get('/', (req, res, next) => {
    User.find({})
        .populate( 'favorites' )
        .then(users => {
            if(!users) { return res.sendStatus(401); }
            return res.json({ 'users': users });
        })
        .catch(next);
});

//Buscar un usuario por id
router.get('/:id', (req, res, next) => {
    let id = req.params.id;
    User.findById(id)
        .populate( 'favorites' )
        .then(user => {
            if (!user) { return res.sendStatus(401); }
            return res.json({ 'user': user })
        })
});

//Verificar Email repetido
router.get('/email/:email', (req, res, next) => {
    let email = req.params.email;
    User.findOne({email: email})
        .then(user => {
            return res.json({ 'user': user })
            // if (!user) { return res.json({ 'rta': "false" }) }
            // else { return res.json({ 'rta': "true" }); } 
        })
});

//Buscar un usuario por usuario y contraseña
router.post('/login', (req, res, next) => {
    console.log(req.body);
    User.findOne({email:req.body.email, password: req.body.password})
        .then(user => {
            return res.json({ 'user': user })
        })
});

//Modificar usuario
//falta modificar recetas favoritas
router.put('/:id', (req, res, next) => {
    User.findOneAndUpdate({ _id: req.params.id }, 
        {$set:
            {
            name: req.body.name,
            lastname: req.body.lastname,
            username: req.body.username,
            email: req.body.email,
            }
        },
        { new: true }, function (err, user) {
            if (err)
                res.send(err);
            res.json(user);
        });
});

//Eliminar usuario.
router.delete('/:id', (req, res, next) => {
    Recipe.find({creator:req.params.id},(err, recipes) => {
        if(!recipes)
        {
            User.findByIdAndRemove(req.params.id, (err, user) => {
                let response = {
                    message: "User successfully deleted",
                    id: user._id
                };
                res.status(200).send(response);
                }
            );
        }
        else
        {
            let response = {
                message: "Error. The user has not been eliminated because there are many recipes that belong to him.",
            };
            res.status(409).send(response);
        }
    })
});

module.exports = router;