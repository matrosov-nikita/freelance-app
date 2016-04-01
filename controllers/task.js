var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Task = mongoose.model('Task');
var upload = require('../libs/storage');
var config = require('../config/config');
var HttpError = require('../error/http_error');
var chat = require('../libs/chat');
var config = require('../config/config');
router.get('/add', function(req,res) {
   res.render('customer');
});
router.get('/get', function(req,res) {
    res.render('executer');
});

router.get('/getTasks', function(req,res,next) {
    Task.get(/Поиск исполнителей/i,req.query.page, function(err,tasks) {
        if (err) return next(err);
        res.json(tasks);
    });
});


router.post('/add/comment', function(req,res,next) {
    console.log(req.body);
    Task.findOne({_id: req.body.id},(err,task)=> {
       if (err) return next(err);
        task.addComment(req.body.comment,(err)=> {
            if (err) return next(err);
            task.findExecuter((err,executer) => {
                var User = mongoose.model("User");
                User.findOne({_id: executer._id}, (err,user) => {
                   if (err) return next(err);
                    user.setMark(req.body.mark,(err,result) => {
                        if (err) return next(err);
                        task.changeStatus();
                        res.send(true);
                    });
                });
            });
        })
    });
});
router.post('/add', function(req,res,next) {
    upload.array('files', config.get("maxCountFiles"))(req, res, function (err) {
        if (err) return next(err);

        Task.add(req.body, function (err, task) {
            if (err) return next(err);
            req.files.forEach(function (el) {
                task.files.push({"name": el.filename, "original": el.originalname});
            });
            task.author = req.user._id;

            task.save((err)=> {
                if (err) return next(new HttpError(422, err.errors));
                task.changeStatus();
                res.redirect("/request/get");

            });
        });
    });
});
router.post('/update', function(req,res,next) {

    upload.array('files', config.get("maxCountFiles"))(req,res, function(err) {
        if (err) return next(err);
        Task.findOne({_id: req.body.id}, (err,task)=> {
            if (err) return next(err);
            task.edit(req.body, function(err,task) {
                if (err) return next(err);
                if (req.files.length>0)
                {
                    task.files = [];
                    req.files.forEach(function(el) {
                        task.files.push({ "name" : el.filename, "original": el.originalname});
                    });
                }
                task.save((err)=> {
                    if (err) return next(new HttpError(422,err.errors));
                    res.json(true);
                });

            });
        });

    });
});
router.get('/viewresult/:id', function(req,res,next) {
    Task.findOne({_id: req.params.id}).populate('author').exec((err,task)=> {
        if (err) return next(err);
        res.render(
            'view_result',
            {
                task: task
            }
        );
    });
});

router.get('/count', function(req,res,next) {
    Task.getCount((err,result)=> {
       if (err) return next(err);

        res.json(Math.ceil(result/config.get('tasksPerPage')));
    });
});

module.exports = router;
