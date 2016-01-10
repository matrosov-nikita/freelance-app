var escape = require('escape-html');
module.exports = function(req,res,next) {
    for (var key in req.body) {
        if (key!='password') {
            req.body[key] = escape(req.body[key]);
        }
    }
    next();
};