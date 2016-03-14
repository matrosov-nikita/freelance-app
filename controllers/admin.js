var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

router.get('/', (req,res)=> {
    res.render('admin');
});

router.get('/users',(req,res,next)=> {
    var User = mongoose.model("User");
    var result = [];
    var customerPromises = [];
    var executerPromises = [];
    User.getAll((err,users)=> {
        if (err) return next(err);
        users.forEach((user)=> {
            customerPromises.push(user.getOrdersCount());
            executerPromises.push(user.getExecuterCount())
        });
        Promise.all(customerPromises).then(amounts => {
            users.map((user,index)=> {
                result.push({
                    user: user,
                    customerOrders: amounts[index]
                });
            });
        },(err)=> { return next(err)});

        Promise.all(executerPromises).then(amounts => {
            result.map((item,index)=> {
                item.executerOrders = amounts[index];
            });
            res.json(result);
        },(err)=> { return next(err)});
    });
});


module.exports = router;