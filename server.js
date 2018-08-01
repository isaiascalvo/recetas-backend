var express = require('express');
var mongoose = require('mongoose');
var cors = require('cors');
//var moment = require('moment');


//moment().format();

var app = express();
app.use(cors());

app.set('port' , process.env.PORT || 7575);
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/Recetas');
mongoose.set('debug',true);

require('./models/sportComplex.js');
require('./models/user.js');
require('./models/reservation.js');

//Routes
app.use(require('./routes'));

var router=express.Router();

app.use(router);

app.listen(app.get('port'), () => {
  console.log('We are live on ' + app.get('port'));
});
