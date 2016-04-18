var express = require('express');
var path = require('path');
var router = express.Router();
var mongoose = require('mongoose');
var User = mongoose.model('User');
var EmailSender = require("../libs/EmailSender");
var upload = require('../libs/storage');
var CheckUser = require('../middleware/checkUser');
var config = require('../config/config');
var Portfolio = mongoose.model('Portfolio');
var HttpError  = require('../error/http_error');
var chat = require('../libs/chat');

router.get('/:id', CheckUser,function(req, res) {
    if (req.user._id == req.params.id) {
        req.user.getWorks(function (err, works) {
            if (err) return next(err);
            res.render('main', {
                works: works,
                user_info: req.user,
                access: true
            });
        });
    } else {
        User.findById({_id: req.params.id}, function (err, user) {
            user.getWorks(function (err, works) {
                if (err) return next(err);
                res.render('main', {
                    works: works,
                    user_info: user,
                    access: false
                });
            });
        });
    }
});


router.get('/activate',function(req,res) {
    res.render('activation');
});

router.post('/register', function(req,res,next) {
    User.register(req.body, function(err,user) {
        if (err) {
            return  next(err);
        }
        else {
            var sender = new EmailSender(user._hash);
            sender.send(function(err) {
               if (err) return next(err);
            });
            res.send("/user/activate");
        }
    });
});

router.post('/authorize', function(req,res,next) {
    if (req.user)
    {
       res.send('/user');
    }
    else {
       User.authorize(req.body.login, req.body.password, function(err,user) {
        if (err) return next(err);
            req.session.user = user._id;
            res.locals.user = user;

            res.send('/user/'+user._id);
       });
    }
});

router.get('/verify', function(req,res,next) {
    User.findOne({_hash: req.query.hash}, function(err,user) {
       if (err) return next(err);
       if (!user) {
           return next(new HttpError(404,"Пользователь не регистрировался на этом сайте"));
       } else {
           user.confirmEmail = true;
           user.save();
           req.session.user = user._id;
           res.locals.user = user;
           res.redirect('/user/'+user._id);
       }
    });
});

router.post('/logout',CheckUser, function(req,res) {
    req.session.destroy();
    res.send('/');
});

router.post('/update', CheckUser, function(req,res,next) {
    req.user.edit(req.body, function(err,user) {
        if (err) return next(err);
        res.redirect("/user/"+user._id);
    });
});

router.post('/upload',CheckUser, function(req,res,next) {

    upload.array('files', config.get("maxCountFiles"))(req,res, function(err) {
       if (err) return next(err);
       if (req.body.user!=req.user._id) return next(new HttpError(403,"Недостаточно прав"));
        var portfolio = new Portfolio( {
            name: req.body.name,
            description: req.body.description
        });
          req.files.forEach(function(el) {
              portfolio.files.push({ "name" : el.filename, "original": el.originalname});
          });
        portfolio.save(function(err) {
            if (err) return next(new HttpError(422,err.errors));
            req.user.works.push(portfolio._id);
            req.user.save();
            res.json(portfolio);
        });

    });
});

router.get('/tasks/get', CheckUser, function(req,res,next) {
    var Task = mongoose.model('Task');
    Task.getByCustomerId(req.user._id, (err,tasks) => {
       if (err) return next(err);
            res.render('customer_tasks',{
                my_tasks: tasks
            });
    });
});

router.post('/tasks/delete',CheckUser, function(req,res,next) {
   var Task = mongoose.model('Task');
    Task.findOne({_id: req.body.task_id},(err,task) => {
        if (err) return next(err);
        if (req.user.role!="Администратор" && (task.author.toString() != req.user._id.toString() || task.status!='Поиск исполнителей'))
        return next(new HttpError(403,'Недостаточно прав для удаления данного задания'));

        task.remove((err) => {
            if (err) return next(err);
            res.json('Задание успешно удалено');
        })
    });
});

router.post('/delete', function(req,res,next) {
    User.findOne({_id: req.body.id}, function(err,user) {
        if (err) return next(err);
        res.send(true);
      user.remove((err)=> {
          if (err) return next(err);
          res.send(true);
      })
    })
});


router.post('/remember',function(req,res,next) {

});


module.exports = router;


