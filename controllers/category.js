var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Category = mongoose.model('Category');

router.use('/get', function(req,res,next) {
    Category.getList(function(err,categories) {
        if (err) return next(err);
        res.json(categories);
    });
});


module.exports = router;