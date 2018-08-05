var router = require('express').Router();

router.use('/api/user', require('./user'));
router.use('/api/recipe', require('./recipe'));
router.use('/api/category', require('./category'));
router.use('/api/ingredient', require('./ingredient'));
router.use('/api/itemRecipe', require('./itemRecipe'));
router.use('/api/votation', require('./votation'));
router.use('/api/image', require('./image'));

module.exports=router;
