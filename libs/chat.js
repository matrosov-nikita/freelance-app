var subscribes = {};
var mongoose = require('mongoose');

var status_messages = {
    'Поиск исполнителей': 'Задание опубликовано в системе. Ждите заявок',
    'В работе': 'Задание перешло в работу.',
    'Ожидает проверки': 'Задание ожидает проверки.',
    'Арбитраж': 'Задание передано в арбитраж',
    'Выполнено': 'Задание подтверждено'
};

var sendNotification = (task,note) => {
    var Notification = mongoose.model('Notification');
    Notification.populate(note,{path: 'task'},(err,pop_note)=> {
        subscribes[task._id].forEach((res)=> {
            res.send({note: pop_note, type: 'notification'});
        });
        subscribes[task._id]=[];
    });
};

exports.addNotification = (task) => {
    var Notification = mongoose.model('Notification');
    Notification.add({
        text: status_messages[task.status],
        task: task._id
    },(err,note)=> {
        if (subscribes[task._id]) {
            subscribes[task._id].forEach((res)=> {
                note.recipients.push(res.locals.user._id);
            });
            note.save();
            sendNotification(task, note);
        }
        else
        {
            note.recipients.push(task.author);
            note.save();
        }
    })
};

exports.subscribe = (task,user) => {
    if (!(task in subscribes)) subscribes[task]=[];
    subscribes[task].push(user);
    user.on('close', ()=> {
        Object.keys(subscribes).forEach((task)=> {
            var index = subscribes[task].indexOf(user);
            if (index!==-1) subscribes[task].splice(index,1);
        });
    });
};

exports.getSubscribers = () => {
    return subscribes;
};

exports.getStatusMessages = () => {
    return status_messages;
};

exports.sendMessage = (task,message) => {
  subscribes[task].forEach((user)=> {
      user.send(message);
  });
    subscribes[task] = [];
};




