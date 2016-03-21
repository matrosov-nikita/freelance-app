var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Request = mongoose.model('Request');
var HttpError = require('../error/http_error');
var upload = require('../libs/storage');
var config = require('../config/config');

router.get('/get',function(req,res) {
    res.render('requests');
});

router.get('/getown', function(req,res) {
    res.render('own_requests')
});

router.get('/getRequests', function(req,res) {
    req.user.getAllRequests(function(err,requests){
           if (err) return next(err);
           res.json(requests);
    });
});

router.get('/getOwnRequests', function(req,res) {
    req.user.getOwnRequests(function(err,requests) {
        if (err) return next(err);
        res.json(requests);
    });
});

router.get('/sendresult/:request', function(req,res,next) {
    var request = req.params.request;
    Request.findById({_id: request}, function(err,request) {
        if (err) return next(err);
        if (JSON.stringify(request.executer) == JSON.stringify(req.user._id)) {
            var Task = mongoose.model('Task');
            Task.findById({_id: request.task}).populate('author').exec((err,task)=> {
                if (err) return next(err);
                res.render('send_result', {
                    task: task
                })
            });
        }
        else {
            return next(new HttpError(403,"Вы не подавали заявку на выполнение данного задания"));
        }
    })
});
    router.post('/sendresult', function(req,res,next) {
        upload.array('files', config.get("maxCountFiles"))(req,res, function(err) {
            if (err) return next(err);
            var Task = mongoose.model('Task');
            Task.findOne({_id: req.body.task}, function(err,task) {
                if (err) return next(err);
                task.result.message = req.body.message;
                task.status = "Ожидает проверки";
                req.files.forEach(function(el) {
                    task.result.files.push({ "name" : el.filename, "original": el.originalname});
                });
                task.save();

            });
        });
        res.redirect("/request/getown");
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