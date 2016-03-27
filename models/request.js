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
    },
    accepted: {
        type: Boolean,
        default: false
    }
});

request.statics.add = function(data, callback) {
    var request  = new Request({
        executer: data.author,
        message: data.message,
        date: new Date(),
        task: data.task_id
    });
       var Task = mongoose.model('Task');
       Task.findOne({_id: data.task_id}, function(err,task) {
           if (err) return callback(err);
           if (!task) {
               return callback(new HttpError(404,"Задание не найдено"));
           }
           else {
               var Request = mongoose.model('Request');
               Request.find({_id: {$in: task.requests}}, function (err, requests) {
                   if (requests.some(el=>JSON.stringify(el.executer) == JSON.stringify(data.author))) {
                       return callback(new HttpError(404, "Вы уже оставляли заявку на это задание"));
                   }
                   else {
                       task.requests.push(request._id);
                       task.save();
                       request.save();
                       return callback(null);
                   }
               });
           }
    });
};

request.methods.refuse = function(callback) {
        var Task = mongoose.model("Task");
        Task.getByRequest(this._id, function (err, task) {
            if (err) return callback(err);
            else {
                var index = task.requests.indexOf(this._id);
                task.requests.splice(index, 1);
                task.save();
                callback(null, true);
            }
        });
};

request.methods.accept = function(callback) {
        this.accepted = true;
        this.save(function(err) {
            if (err) return callback(new HttpError(401,"Не удалось принять заявку"));
        });
        var Task = mongoose.model("Task");
        Task.getByRequest(this._id, function (err, task) {
            if (err) return callback(err);
            else {
                task.changeStatus("В работе");
                task.save();
                return callback(null,task);
            }
        });
    };

request.statics.getMyExecuterTasks = function(executer,cb) {
    Request.find({executer: executer},'task',(err,tasks)=> {
        if (err) return cb(err);
        return cb(null,tasks);
    })
};

Request = module.exports = mongoose.model("Request",request);