module.exports = function(req,res,next) {
    res.sendHttpError = function(error)
    {
        res.status(error.status);
        console.log(res.req.headers['x-requested-with']);
        if (res.req.headers['x-requested-with'] == 'XMLHttpRequest') {
            res.json(error);
        }
        else {
            res.render('error', {error: error});
        }
    };
    next();
};