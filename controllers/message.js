var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var chat = require('../libs/chat');

router.post('/add', (req,res,next)=> {
    var Message = mongoose.model("Message");
    Message.add(req.body,req.user._id, function(err,mes) {
       if (err) return next(err);
       res.send(true);
    });
});

router.get('/getByTask', (req,res,next)=> {
    console.log("sadad");
    var task_id = req.query.task;
    console.log(task_id);
    var Message = mongoose.model("Message");
    Message.getMessagesByTask(task_id, function(err,messages) {
        if (err) return next(err);
        console.log(messages);
        res.json(messages);
    })
});

router.get('/subscribe',(req,res)=> {
    var Task = mongoose.model('Task');
    Task.getMyTasks(req.user, function(err,mytasks) {
        if (err) return next(err);
        mytasks.forEach((task)=> {
            chat.subscribe(task._id,res);
        });
        res.send();
    });
});


module.exports = router;