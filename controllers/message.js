var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var chat = require('../libs/chat');

router.post('/add', (req,res,next)=> {
    var task = req.body.task;
    var Message = mongoose.model("Message");
    Message.add(req.body,req.user._id, function(err,mes) {
       if (err) return next(err);
       chat.send(task,mes);
        res.send();
    });
});

router.get('/getByTask', (req,res,next)=> {
    var task_id = req.query.task;
    var Message = mongoose.model("Message");
    Message.getMessagesByTask(task_id, function(err,messages) {
        if (err) return next(err);
        res.json(messages);
    })
});

router.get('/subscribe/customer',(req,res)=> {
    var Task = mongoose.model('Task');
    Task.getMyCustomerTasks(req.user, function(err,mytasks) {
        if (err) return next(err);
        mytasks.forEach((task)=> {
            chat.subscribe(task._id,res);
        });
    });
});

router.get('/subscribe/executer', (req,res) => {
   var Request = mongoose.model('Request');
    Request.getMyExecuterTasks(req.user._id,(err,tasks) => {
        if (err) return next(err);
        tasks.forEach((task)=> {
            chat.subscribe(task.task,res);
        });
    });
});

router.get('/subscribe/:task',(req,res)=> {
   chat.subscribe(req.params.task,res);
});


module.exports = router;