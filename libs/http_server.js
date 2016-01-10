'use strict';
var express = require('express'),
Controller = require("../controllers");
var sassMiddleware = require('node-sass-middleware');
var path = require('path');
var body_parser = require('body-parser');
var HttpError = require('../error');
var ErrorHandler = require('errorhandler');
var conf = require('../config/config');
var mongoose = require('mongoose');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var checkAuth = require('../middleware/checkUser');
var Category = mongoose.model('Category');

var app = express();

class Server {

    constructor(port, host) {
      this.port =  port;
      this.host = host;
    }

    init() {
        app.set('view engine','jade');
        app.locals.pretty = true;
        app.use(require("../middleware/sendHttpError"));
        app.use(body_parser.json());
        app.use(body_parser.urlencoded({
            extended: true
        }));
        app.use(sassMiddleware({
            src: path.join(__dirname, '../public/sass'),
            dest: path.join(__dirname, '../public/css'),
            indentedSyntax: true,
            outputStyle: 'compressed',
            prefix: '/css'
        }));
        app.use(express.static('public'));

        app.use(session({
            secret: conf.get("session:secret"),
            key: conf.get("session:key"),
            cookie: conf.get("session:cookie"),
            store: new MongoStore({mongooseConnection: mongoose.connection})
        }));

        app.use(require('../middleware/loadUser'));


        app.get('/', function(req,res) {
            res.render('auth');
        });

        app.use('/category',Controller.Category);

        app.use('/task',Controller.Task);

        app.use("/user",Controller.User);

        app.use('/request', Controller.Request);


        app.use(function(err,req,res,next) {
           if (typeof err == "number")
           {
               err = new HttpError(err);
           }
           if (err instanceof HttpError)
           {
               res.sendHttpError(err);
           }
           else {
               if (app.get('env')=="development")
               {
                   ErrorHandler()(err, req, res, next);
               }
               else {
                   console.log(err);
                   err = new HttpError(500);
                   res.sendHttpError(err);
               }
           }
        });
    }

    run() {
        this.init();
        app.listen(this.port, () => {
           console.log("Сервер запущен");
        });
    }
}

module.exports = Server;