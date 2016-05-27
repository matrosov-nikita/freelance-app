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
                        result.score+=task.price;
                        result.rating+=task.price;
                        result.save();
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
        if (req.user.score < req.body.price)
        {
            return next(new HttpError(416,"Недостаточно средств для размещения задания"));
        }
        else {
            Task.add(req.body, function (err, task) {
                if (err) return next(err);
                req.files.forEach(function (el) {
                    task.files.push({"name": el.filename, "original": el.originalname});
                });
                task.author = req.user._id;

                task.save((err)=> {
                    if (err) {
                        return next(new HttpError(422, err.errors));
                    }
                    req.user.score-=req.body.price;
                    req.user.save();
                    task.changeStatus();
                    res.redirect("/request/get");

                });
            });
        }
    });
});
router.post('/update', function(req,res,next) {
    upload.array('files', config.get("maxCountFiles"))(req,res, function(err) {
        if (err) return next(err);

        Task.findOne({_id: req.body.id}).populate('author').exec((err,task)=> {
            if (err) return next(err);
            if (task.status!="Поиск исполнителей")
            return next(new HttpError(403,"Задание находится в состоянии "+task.status+".Редактирование невозможно"));
            var diff = req.body.price - task.price;
            if (task.author.score >= diff)
            {
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
                        task.author.score -= diff;
                        task.author.save((err)=> {
                            if (err) return next(new HttpError(422,err.errors));
                            res.json(true);
                        });

                    });
                });
            }
            else {
                return next(new HttpError(403,"Недостаточно денег на балансе.Редактирование невозможно"));
            }
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
router.get('/my/get', function(req,res,next) {
    res.render('customer_tasks')
});

router.get('/my/customerall', function(req,res,next) {
    Task.getByCustomerId(req.user._id, (err,tasks) => {
        if (err) return next(err);
        res.json(tasks);
    });
});

router.get('/my/executerall', function(req,res,next) {
    var Request = mongoose.model('Request');
    Request.getMyExecuterTasks(req.user._id,(err,tasks) => {
        if (err) return next(err);
        tasks = tasks.map((el)=> {
            return el.task;
        });
        res.json(tasks);
    });
});

router.get('/count', function(req,res,next) {
    Task.getCount((err,result)=> {
       if (err) return next(err);

        res.json(Math.ceil(result/config.get('tasksPerPage')));
    });
});


module.exports = router;
