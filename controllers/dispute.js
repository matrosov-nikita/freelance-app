var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

router.post('/add', (req,res,next)=> {
   var Task = mongoose.model("Task");
   Task.findOne({_id: req.body.task_id}, (err,task) => {
      if (err) return next(err);
      task.addDispute(req.body.message,(err,task) => {
         if (err) return next(err);
         res.json(true);
      });
   });
});

router.get('/',(req,res)=> {
   res.render("dispute");
});
router.get('/getIDs',(req,res,next)=> {
   var Task = mongoose.model("Task");
   Task.find({status: "Арбитраж"},'_id',(err,tasks)=> {
      if (err) return next(err);
      res.send(tasks);
   });
});
router.get('/getInfo',(req,res,next)=> {
   var Task = mongoose.model('Task');
   Task.findOne({_id: req.query.id},(err,task)=> {
      if (err) return next(err);
      res.send(task);
   })
});
router.post('/resolve',(req,res,next)=> {
   var Task = mongoose.model("Task");
   Task.findOne({_id:req.body.task},(err,task)=> {
      if (err) return next(err);
      task.addComment("Арбитраж."+req.body.message,(err,task)=> {
            task.findExecuter((err,executer) => {
               var User = mongoose.model("User");
               User.findOne({_id: executer._id}, (err,user) => {
                  if (err) return next(err);
                  user.setMark(req.body.mark,(err,user) => {
                     if (err) return next(err);
                     if (req.body.choose==0) { //в пользу заказчика
                        User.findOne({_id: task.author},(err,author)=> {
                           author.score+=task.price;
                           author.save();
                        });
                     }
                     else
                     {
                        user.score+=task.price; //в пользу исполнителя
                        user.rating+=task.price;
                        user.save();
                     }
                     res.redirect('/dispute')
                  });
                  });
               });
      });
   });
});

module.exports = router;