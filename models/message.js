var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var message = new Schema({
    text: {
        type: String,
        minlength: [1,'Минимальная длина сообщения  1 символ'],
        maxlength:[100,'Максимальная длина сообщения 100 символов']
    },
    author: {
        type: Schema.ObjectId, ref: 'User'
    },
    task: {
        type: Schema.ObjectId, ref: 'Task'
    },
    datePublish: {
        type: Date
    }

});

message.statics.add  = function(data,author,cb) {
    var message = new Message({
        text: data.text,
        author: author,
        task: data.task,
        datePublish: new Date()
    });
    message.save(function(err,mes){
        if (err) return cb(err);
        return cb(null,mes);
    });
};

message.statics.getMessagesByTask = function(task,cb)
{
    Message.find({task: task}, (err,msgs) => {
       if (err) return cb(err);
        return cb(null,msgs);
    }).populate('author','_id name');
};


var Message = module.exports = mongoose.model("Message",message);