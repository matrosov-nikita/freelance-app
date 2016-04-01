var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var notification = new Schema({
    text: {
        type: String,
        minlength: [1,'Минимальная длина сообщения  1 символ'],
        maxlength:[100,'Максимальная длина сообщения 100 символов']
    },

    recipients:[{type: Schema.ObjectId, ref: 'User'}],

    task: {
        type: Schema.ObjectId, ref: 'Task'
    },
    datePublish: {
        type: Date
    }

});

notification.statics.add = function(data,cb) {
    var notify = new Notification({
        text: data.text,
        task: data.task,
        datePublish: new Date()
    });
    notify.save((err)=> {
        if (err) return cb(err);
        return cb(null,notify);
    })
};

notification.statics.get = function(user,cb) {
  Notification.find({recipients: user}).populate('task').exec((err,notifications)=> {
      if (err) return cb(err);
      return cb(null,notifications);
  })
};
var Notification = module.exports = mongoose.model("Notification",notification);