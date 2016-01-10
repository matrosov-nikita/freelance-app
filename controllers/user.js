var express = require('express');
var path = require('path');
var router = express.Router();
var mongoose = require('mongoose');
var User = mongoose.model('User');
var EmailSender = require("../libs/EmailSender");
var upload = require('../libs/storage');
var Credentials = require('../middleware/checkCredentials');
var CheckUser = require('../middleware/checkUser');
var config = require('../config/config');
var Portfolio = mongoose.model('Portfolio');

router.get('/', CheckUser,function(req, res) {
    console.log("main");
    res.render('main');
});

router.get('/getWorks',CheckUser, function(req,res) {
    req.user.getWorks(function(err,works) {
       if (err) return next(err);
        res.json(works);
    });
});

router.post('/register',Credentials.checkLoginAndPassword,
                        Credentials.checkEmail,
                        Credentials.checkName,
    function(req,res,next) {
    User.register(req.body, function(err,user) {
        if (err) {
            return  next(err);
        }
        else {
            var sender = new EmailSender(user._hash);
            sender.send(function(err) {
               if (err) return next(err);
            });
            res.send("Пожалуйста, подтвердите регистрацию!");
        }
    });
});



router.post('/authorize', Credentials.checkLoginAndPassword, function(req,res,next) {
    if (req.user)
    {
       res.redirect('/user');
    }
    else {
       User.authorize(req.body.login, req.body.password, function(err,user) {
        if (err) return next(err);
            req.session.user = user._id;
            res.locals.user = user;
            res.redirect('/user');

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
           res.redirect('/user');
       }
    });
});

router.post('/logout',CheckUser, function(req,res) {
    req.session.destroy();
    res.redirect('/');
});

router.post('/update', CheckUser, function(req,res,next) {
    req.user.edit(req.body, function(err,user) {
        if (err) return next(err);
        res.redirect("/user");
    });
});

router.post('/upload',CheckUser, function(req,res,next) {
    upload.array('files', config.get("maxCountFiles"))(req,res, function(err) {
       if (err) return next(err);
        var portfolio = new Portfolio( {
            name: req.body.name,
            description: req.body.description
        });
          req.files.forEach(function(el) {
              portfolio.files.push({ "name" : el.filename, "original": el.originalname});
          });
        portfolio.save(function(err) {
           if (err) return next(err);
        });
        req.user.works.push(portfolio._id);
        req.user.save();
        res.redirect('/user');
    });
});


router.post('/remember',function(req,res,next) {

});


module.exports = router;


