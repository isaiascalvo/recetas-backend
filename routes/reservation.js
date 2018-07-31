var mongoose = require('mongoose');
var router = require('express').Router();
var Reservation = mongoose.model('reservation');
var User = mongoose.model('user');
var SportComplex = mongoose.model('sportComplex');
var moment = require('moment');

//Crear reservación
router.post('/', (req, res, next) => {
    let date = req.body.date;
    let sportComplex = req.body.sportComplex;
    let user = req.body.user;
    let field = req.body.field;

    var reservation = new Reservation({
        date: date,
        sportComplex: sportComplex,
        user: user,
        field: field
    });
    reservation.save();
    res.send("Reservation had been posted \n" + reservation);
});

//Listar todos las reservas
router.get('/', (req, res, next) => {
    Reservation.find({})
        .populate( 'sportComplex' )
        .populate( 'user' )
            .exec(function (err, reservations) {
                return res.json({ 'reservations': reservations })
            })                
    .catch(next);
   
});

//Listar las reservas de un SportComplex
router.get('/allRes/:id', (req, res, next) => { 
    let id = req.params.id;
    Reservation.find({sportComplex:id})
        .populate( 'sportComplex' )
        .populate( 'user' )
            .exec(function (err, reservations) {
                return res.json({ 'reservations': reservations })
            })                
    .catch(next);
   
});

//Listar las reservas de un User
router.get('/allMyRes/:id', (req, res, next) => { 
    let id = req.params.id;
    Reservation.find({user:id})
        .populate( 'sportComplex' )
        .populate( 'user' )
            .exec(function (err, reservations) {
                return res.json({ 'reservations': reservations })
            })                
    .catch(next);
   
});

//Listar las reservas pendientes
router.get('/pending', (req, res, next) => { 
    Reservation.find({date:{$gt: moment().add('hour',-1)}}) //"<YYYY-mm-ddTHH:MM:ssZ>"
        .populate( 'sportComplex' )
        .populate( 'user' )
            .exec(function (err, reservations) {
                return res.json({ 'reservations': reservations })
            })                
    .catch(next);      
});

//Listar las reservas pendientes de un SportComplex
router.get('/pendRes/:id', (req, res, next) => { 
    let id = req.params.id;
    Reservation.find({date:{$gt: moment().add('hour',-1)},sportComplex:id}) //"<YYYY-mm-ddTHH:MM:ssZ>"
        .populate( 'sportComplex' )
        .populate( 'user' )
            .exec(function (err, reservations) {
                return res.json({ 'reservations': reservations })
            })                
    .catch(next);      
});

//Listar las reservas pendientes de un User
router.get('/pendMyRes/:id', (req, res, next) => { 
    let id = req.params.id;
    Reservation.find({date:{$gt: moment().add('hour',-1)},user:id}) //"<YYYY-mm-ddTHH:MM:ssZ>"
        .populate( 'sportComplex' )
        .populate( 'user' )
            .exec(function (err, reservations) {
                return res.json({ 'reservations': reservations })
            })                
    .catch(next);      
});

//Listar una reserva
router.get('/:id', (req, res, next) => {
    let id = req.params.id;
    Reservation.findById(id)
        .populate( 'sportComplex' )
        .populate( 'user' )
        .exec(function (err, reservation) {
            console.log(reservation);
            return res.json({ 'reservation': reservation })
        })
    .catch(next);
});

//Modificar una reserva
router.put('/:id', (req, res, next) => {
    Reservation.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true }, function (err, reservation) {
        if (err)
            res.send(err);
        res.json(reservation);
    });
    //res.send("Reservation updated");

});

//Eliminar una reserva
router.delete('/:id', (req, res, next) => {
    Reservation.findByIdAndRemove(req.params.id, (err, reservation) => {
        let response = {
            message: "Reservation successfully deleted",
            id: reservation._id
        };
        res.status(200).send(response);
    });
});

module.exports = router;
