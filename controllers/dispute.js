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

router.get('/getDispute',(req,res)=> {
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

module.exports = router;