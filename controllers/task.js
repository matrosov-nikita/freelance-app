var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Task = mongoose.model('Task');
var upload = require('../libs/storage');
var config = require('../config/config');
var HttpError = require('../error/http_error');

router.get('/add', function(req,res) {
   res.render('customer');
});
router.get('/get', function(req,res) {
    res.render('executer');
});

router.get('/getTasks', function(req,res,next) {
    Task.get(req.user, function(err,tasks) {
        if (err) return next(err);
        res.json(tasks);
    });
});

router.post('/add', function(req,res,next) {
    upload.array('files', config.get("maxCountFiles"))(req,res, function(err) {
        if (err) return next(err);

        Task.add(req.body, function(err,task) {
            if (err) return next(err);
            req.files.forEach(function(el) {
                task.files.push({ "name" : el.filename, "original": el.originalname});
            });
            task.author = req.user._id;
            task.save((err)=> {
                if (err) return next(new HttpError(422,err.errors));
                res.redirect("/request/get");
            });

        });
    });

});

router.get('/viewresult/:id', function(req,res,next) {
    Task.findOne({_id: req.params.id}, function(err,task) {
       if (err) return next(err);
        res.render(
            'view_result',
            {
                task: task
            }
        );
    });
});

module.exports = router;
