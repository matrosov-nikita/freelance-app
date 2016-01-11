var HttpError = require('../error/http_error');

module.exports =function(req,res,next) {
  if (!req.session.user) {
      return next(new HttpError(403,"Вы не авторизованы"));
  }
    next();
};