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


module.exports = router;