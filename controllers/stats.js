var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

router.get('/ordersperdate', (req,res,next)=> {
    var Task = mongoose.model('Task');
    var result = {};
    Task.find({author: req.query.id},(err,tasks)=> {
        if (err) return next(err);
        tasks.forEach((task)=> {
            var day = new Date(task._created).toDateString();
            result[day] = result[day]+1 || 1;
        });
        res.json(result);
    })
});

router.get('/worksperdate',(req,res,next)=> {
   var result = {};
   var Request = mongoose.model('Request');
    Request.find({executer:req.query.id}).select('task').populate('task').exec((err,tasks)=> {
        if (err) return next(err);
       tasks = tasks.filter((item)=> {
           return item.task.status=="Выполнено";
       });
        tasks.forEach((item)=> {
            var day = new Date(item.task._created).toDateString();
            result[day] = result[day]+1 || 1;
        });
        res.json(result);
    });
});

module.exports = router;