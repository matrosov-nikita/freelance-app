
var conf = require('./config/config');
var mongoose = require('mongoose');
var models = require('./models')();
var Server = require('./libs/http_server');
var server = new Server(conf.get("port"),conf.get("host"));

var mongoose_address = conf.get("mongoose_address");
mongoose.connect(mongoose_address, function(){
   console.log("Соединился с БД по адресу " +  mongoose_address);
});

server.run();