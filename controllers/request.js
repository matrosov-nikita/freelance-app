var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Request = mongoose.model('Request');


router.get('/get',function(req,res,next) {
    res.render('requests');
});

router.get('/getown', function(req,res) {
    res.render('own_requests')
});
router.get('/getRequests', function(req,res) {
    req.user.getAllRequests(function(err,requests){
           if (err) return next(err);
        console.log(requests);
           res.json(requests);
    });
});

router.get('/getOwnRequests', function(req,res) {
    req.user.getOwnRequests(function(err,requests) {
        if (err) return next(err);
        console.log(requests);
        res.json(requests);
    });
});

router.post('/add', function(req,res,next) {
    req.body.author = req.user._id;
    Request.add(req.body, function(err) {
        if (err) return next(err);
        res.send("Заявка отправлена заказчику");
    });

});


router.post("/refuse", function(req,res,next) {
    Request.findByIdAndRemove({_id: req.body.request}, function(err,request) {
        if (err) return next(err);
        if (!request) {
            return next(new HttpError(404,'Заявка не найдена'));
        }
        else {
            request.refuse(function(err,result) {
                if (err) return next(err);
                res.json(result);
            });
        }
    });
});

    router.post("/accept", function(req,res,next) {
        Request.findById({_id: req.body.request}, function(err,request) {
            if (err) return next(err);
            if (!request) {
                return next(new HttpError(404,'Заявка не найдена'));
            }
            else {
            request.accept(function(err,result) {
                if (err) return next(err);
                res.json(result);
            });
        }
      });
    });

module.exports = router;