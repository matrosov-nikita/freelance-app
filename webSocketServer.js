var app         = require('express');
var http 		= require('http').Server(app);
var io   		= require('socket.io')(http);
var mongoose 	= require('mongoose');
var models      = require('./models')();

var mongoose_address = "mongodb://localhost/test";
mongoose.connect(mongoose_address, function(){
    console.log("Соединился с БД по адресу " +  mongoose_address);
});
var subscribers = {};

var status_messages = {
    'Поиск исполнителей': 'Задание опубликовано в системе. Ждите заявок',
    'В работе': 'Задание перешло в работу.',
    'Ожидает проверки': 'Задание ожидает проверки.',
    'Арбитраж': 'Задание передано в арбитраж',
    'Выполнено': 'Задание подтверждено'
};

var addSubscriberId = (id,task) => {
    if (!(task in subscribers)) subscribers[task] = [];
    if (!subscribers[task].includes(id)) subscribers[task].push(id);
};


io.on('connection', function(socket){

//удаляем из всех комнат
    socket.on('disconnect', function(){
        console.log("DISCONNET");
        socket.disconnect();
    });

//подписка на все свои задания
    socket.on('subscribe', function(author) {
        console.log("SUBSCRIBE");
        var Task = mongoose.model('Task');
        var Request = mongoose.model('Request');
        Task.getByCustomerId(author, function(err,tasks) {
            tasks.forEach((task)=>{
                socket.join(task._id);
                addSubscriberId(author,task._id);
            });
            Request.getMyExecuterTasks(author,(err,tasks) => {
                tasks.forEach((el)=> {
                    socket.join(el.task);
                    addSubscriberId(author,el.task);
                });
                console.log(subscribers);
            });
        });
    });

//отправка сообщения всем участникам в комнате
    socket.on('chat message', function(msg,author){
        var Message = mongoose.model('Message');
        Message.add(msg,author, function(err,mes) {
            io.sockets.in(mes.task).emit('chat message', mes);
        });
    });
    //отправка нотификационного сообщения
    socket.on('notific message', function(task) {
        console.log("ДА ЗДЕСЬ Я ЗДЕСь");
        if (task) {
            var Notification = mongoose.model('Notification');
            Notification.add({
                text: status_messages[task.status],
                task: task._id
            },(err,note)=> {
                console.log(note);
                if (task._id in io.sockets.adapter.rooms) {
                    subscribers[task._id].forEach((res)=> {
                        note.recipients.push(res);
                    });
                    note.save((err)=> {
                        Notification.populate(note,{path: 'task'},(err,pop_note)=> {
                            io.sockets.in(task._id).emit('notific message', {note: pop_note, type: 'notification'});
                        });
                    });
                }
                else
                {
                    note.recipients.push(task.author);
                    note.save();
                }
            })
        }
    })
});

run = () => {
    http.listen(3000, function(){
        console.log('listening on *:12345');
    });
};


