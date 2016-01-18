var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var HttpError = require('../error/http_error');

var request = new Schema({

    task: {
        type: Schema.Types.ObjectId, ref: 'Task'
    },

    executer: {
        type: Schema.Types.ObjectId, ref: 'User'
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
        date: new Date(),
        task: data.task_id
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

    request.statics.refuse = function(request_id,callback) {
        Request.findByIdAndRemove({_id: request_id}, function(err,request) {
            if (err) callback(err);
            if (!request) {
                return callback(new HttpError(404,'Заявка не найдена'));
            }
            else {
                var Task = mongoose.model("Task");
                Task.findOne({requests: request._id}, function(err,task) {
                    if (err) callback(err);
                    if (!task) {
                        return callback(new HttpError(404,"Задание не найдено"));
                    }
                    else {
                        var index = task.requests.indexOf(request._id);
                        task.requests.splice(index,1);
                        task.save();
                    }
                });
                callback(null,true);
            }
        });
    };

request.statics.accept = function(request_id,callback) {
    Request.findByIdAndRemove({_id: request_id}, function(err,request) {
        if (err) callback(err);
        if (!request) {
            return callback(new HttpError(404,'Заявка не найдена'));
        }
        else {
            var Task = mongoose.model("Task");
            Task.findOne({requests: request._id}, function(err,task) {
                if (err) callback(err);
                if (!task) {
                    return callback(new HttpError(404,"Задание не найдено"));
                }
                else {
                    var index = task.requests.indexOf(request._id);
                    task.requests.splice(index,1);
                    task.save();
                }
            });
            callback(null,true);
        }
    });
};

Request = module.exports = mongoose.model("Request",request);