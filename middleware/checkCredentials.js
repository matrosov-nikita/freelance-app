var HttpError = require('../error');
module.exports = {
    checkLoginAndPassword: function (req, res, next) {
        var patternLogin = /^[a-zA-Z0-9-_]{5,16}$/;
        var patternPassword = /^.{5,16}$/;
        if (!patternLogin.test(req.body.login)) {
            return next(new HttpError(403, "Логин должен включать только цифры и латинские буквы. Длина от 5 до 16 символов"));
        }
        else if (!patternPassword.test(req.body.password)) {
            return next(new HttpError(403, " Длина пароля от 5 до 16 символов"));
        }
        next();
    },

    checkEmail: function (req, res, next) {
        var patternEmail = /([a-z0-9_-]+\.)*[a-z0-9_-]+@[a-z0-9_-]+(\.[a-z0-9_-]+)*\.[a-z]{2,6}/;
        if (!patternEmail.test(req.body.email)) {
            return next(new HttpError(403, "Некорректный email"));
        }
        next();
    },
    checkName: function(req,res,next) {
        //var patternName = /^([А-ЯЁ][а-яё]+[\-\s]?){3,}$/;
        //if (!patternName.test(req.body.name)) {
        //    return next(new HttpError(403, "Имя должно состоять только из русских букв. Длина от 5 до 50"));
        //}
        next();
    }
}
;