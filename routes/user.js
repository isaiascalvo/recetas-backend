var mongoose = require('mongoose');
var router = require('express').Router();
var User = mongoose.model('user');
var Recipe = mongoose.model('recipe');
const jwt = require('jsonwebtoken');

//Crear un usuario
router.post('/', (req, res) => {
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
    user.save().then(function(){
        res.json(user);
    }, function(err){
        res.send("The user has not been registered correctly");
    })
});

//Listar todos los usuario
router.get('/', (req, res, next) => {
    let token = jwt.decode(req.headers.authorization);
    if (token !== null && token.userType === 1)
    {
        if( Date.now() > token.exp*1000) {
            throw new Error('Token has expired');
        }
        if( Date.now() < token.nbf*1000) {
            throw new Error('Token not yet valid');
        }
        User.find({})
        .populate( 'favorites' )
        .then(users => {
            if(!users) { return res.sendStatus(401); }
            return res.json({ 'users': users });
        })
        .catch(next);
    }
    else
    {
        res.status(403).send("Error. You must be an administrator.");
    }
});

//Buscar un usuario por id
router.get('/access', (req, res) => {

    let token = jwt.decode(req.headers.authorization);
    if (token !== null && token.userID !== null)
    {
        if( Date.now() > token.exp*1000) {
            throw new Error('Token has expired');
        }
        if( Date.now() < token.nbf*1000) {
            throw new Error('Token not yet valid');
        }

        User.findById(token.userID)
        .populate( 'favorites' )
        .then(user => {
            if (!user) { return res.sendStatus(401); }
            return res.json({ 'user': user })
        })
    }
    else
    {
        res.status(403).send("Error. You must login.");
    }
});

//Verificar Email repetido
router.get('/email/:email', (req, res) => {
    let email = req.params.email;
    User.findOne({email: email})
        .then(user => {
            return res.json({ 'user': user })
        })
});

//Buscar un usuario por usuario y contraseña
router.post('/login', (req, res) => {
    // console.log(req.body);
    User.findOne({email:req.body.email, password: req.body.password})
        .then(user => {
            if(!user) return res.sendStatus(401);
            var token = { access_token: jwt.sign({userID: user._id, userType: user.type}, 'recetas-app-shared-secret', {expiresIn: '2h'}), _id: user._id, username: user.username, type: user.type, favorites: user.favorites};
            res.send(token);
        })
});

router.post('/isAdmin', (req, res, next) => {
    let token = jwt.decode(req.headers.authorization);
    if (token !== null && token.userType === 1)
    {
        return res.json({rta : true});
    }
    else
    {
        return res.json({rta : false});
    }
});

//Modificar usuario
//falta modificar recetas favoritas
router.put('/', (req, res) => {
    let token = jwt.decode(req.headers.authorization);
    if (token !== null && token.userID !== null)
    {
        if( Date.now() > token.exp*1000) {
            throw new Error('Token has expired');
        }
        if( Date.now() < token.nbf*1000) {
            throw new Error('Token not yet valid');
        }

        User.findOneAndUpdate({ _id: token.userID }, 
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
    }
    else
    {
        res.status(403).send("Error. You must login.");
    }
});

// Dar o Quitar permisos de administrador
router.put('/permission', (req, res) => {
    let token = jwt.decode(req.headers.authorization);
    if (token !== null && token.userType === 1)
    {
        if( Date.now() > token.exp*1000) {
            throw new Error('Token has expired');
        }
        if( Date.now() < token.nbf*1000) {
            throw new Error('Token not yet valid');
        }

        User.findOneAndUpdate({ _id: req.body._id }, 
            { $set: { type: req.body.type } },
            { new: true }, function (err, user) {
                if (err)
                    res.send(err);
                res.json(user);
            });
    }
    else
    {
        res.status(403).send("Error. You must be an administrator.");
    }
});

//Eliminar usuario.
router.delete('/:id', (req, res) => {
    let token = jwt.decode(req.headers.authorization);
    if (token !== null && token.userID !== null)
    {
        if( Date.now() > token.exp*1000) {
            throw new Error('Token has expired');
        }
        if( Date.now() < token.nbf*1000) {
            throw new Error('Token not yet valid');
        }
        Recipe.find({creator:req.params.id},(recipes) => {
            if(!recipes)
            {
                User.findByIdAndRemove(req.params.id, (user) => {
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
    }
    else
    {
        res.status(403).send("Error. You must login.");
    }
});

module.exports = router;