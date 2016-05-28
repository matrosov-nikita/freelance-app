var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var chat = require('../libs/chat');

router.post('/add', (req,res,next)=> {
    var task = req.body.task;
    var Message = mongoose.model("Message");
    Message.add(req.body,req.user._id, function(err,mes) {
       if (err) return next(err);
        chat.sendMessage(task,mes);
    });
    res.send();
});

router.get('/getByTask', (req,res,next)=> {
    var task_id = req.query.task;
    var Message = mongoose.model("Message");
    Message.getMessagesByTask(task_id, function(err,messages) {
        if (err) return next(err);
        res.json(messages);
    })
});

router.get('/subscribe',(req,res)=> {
    console.log("TASK");
    console.log(req.query.task);
   chat.subscribe(req.query.task,res);
});

router.get('/notify/get',(req,res,next)=> {
   var Notification = mongoose.model('Notification');
   Notification.get(req.user._id, (err,notificationList)=> {
       if (err) return next(err);
       res.send(notificationList);
   })
});

module.exports = router;