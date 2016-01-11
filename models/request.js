var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var HttpError = require('../error/http_error');

var request = new Schema({

    executer: {
        type: Schema.Types.ObjectId
    },

    date: {
        type: Date
    },

    message: {
        type: String
    }
});

request.statics.add = function(data, callback) {
    var request  = new Request({
        executer: data.author,
        message: data.message,
        date: new Date()
    });
    request.save(function(err,request) {
       if (err) callback(err);
       var Task = mongoose.model('Task');
       Task.findOne({_id: data.task_id}, function(err,task) {
           if (err) callback(err);
           if (!task) {
               callback(new HttpError(404,"Задание не найдено"));
           }
           else {
               task.requests.push(request._id);
               task.save();
           }
       });
    });
};


Request = module.exports = mongoose.model("Request",request);