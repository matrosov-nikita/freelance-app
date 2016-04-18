var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

router.get('/', (req,res)=> {
    res.render('admin');
});

router.get('/users',(req,res,next)=> {
    var User = mongoose.model("User");
    User.getAll((err,users)=> {
        if (err) return next(err);
        res.json(users);
    });
});

router.get('/tasks', function(req,res,next) {
    var Task = mongoose.model("Task");
    Task.getAll(function(err,tasks) {
        if (err) return next(err);
        res.json(tasks);
    })
});


module.exports = router;