var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Request = mongoose.model('Request');


router.post('/add',function(req,res,next) {
    Request.add(req.body, function(err) {
        if (err) return next(err);
    });
    res.send("Заявка отправлена заказчику");
});

module.exports = router;