var express = require('express');
var mongoose = require('mongoose');
var cors = require('cors');
const bodyParser = require('body-parser');
const expressJwt = require('express-jwt');
//var moment = require('moment');


//moment().format();

var app = express();
app.use(cors());

app.set('port' , process.env.PORT || 7575);
app.use(express.json());
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/Recetas');
mongoose.set('debug',true);

require('./models/user.js');
require('./models/recipe.js');
require('./models/category.js');
require('./models/ingredient.js');
require('./models/itemRecipe.js');
require('./models/votation.js');
require('./models/image.js');
require('./models/report.js');

//Routes
app.use(require('./routes'));

var router=express.Router();

app.use(router);
app.use(expressJwt({secret: 'recetas-app-shared-secret'}).unless({path: ['/api/user/login']}));

app.listen(app.get('port'), () => {
  console.log('We are live on ' + app.get('port'));
});
