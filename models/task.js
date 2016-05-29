    var mongoose = require('mongoose');
    var Schema = mongoose.Schema;
    var HttpError = require('../error/http_error');
    var io = require('socket.io-client');
    var chat = require('../libs/chat');
    var config = require('../config/config');
    var fs = require('fs');
    var task = new Schema({

        header: {
            type: String,
            required: [true,'Заголовок обязателен для заполнения'],
            minlength: [3,'Минимальная длина заголовка 3 символа'],
            maxlength:[100,'Максимальная длина заголовка 70 символов']
        },

        price: {
            type: Number,
            required:  [true,'Цена обязателена для заполнения'],
            min: [100,'Минимальная стоимость задания 100 рублей'],
            max: [100000,'Максимальная стоимость задания 100000 рублей']
        },

        category: {
            type: Schema.Types.ObjectId, ref: 'Category'
        },

        description: {
            type: String,
            required:  [true,'Описание задания обязательно для заполнения'],
            minlength: [20,'Минимальная длина описания задания 20 символов'],
            maxlength:[4000,'Максимальная длина описания задания 400 символов']
        },
        
        deadline: {
            type: Date,
            required: [true,'Срок сдачи задания обязателен для заполнения']
        },

        files:
            [{
                name: String,
                original: String
            }],

        author : {
            type: Schema.Types.ObjectId, ref: 'User'
        },

        _created: {
            type: Date
        },

        status: {
            type: String,
            required: true,
            enum: ["Поиск исполнителей", "В работе","Ожидает проверки","Арбитраж", "Выполнено"],
            default: "Поиск исполнителей"
        },

        requests:
             [{type: Schema.Types.ObjectId, ref: 'Request'}],

        result: {
            message: { type: String,
                default: '     ',
                minlength:[5,'Минимальная длина сообщения результата 5 символов'],
                maxlength:[4000,'Максимальная длина сообщения результата 4000 символов']
            },
            files:
                [{
                    name: String,
                    original: String
                }]
        },

        dispute: {
            type: String,
            default: '     ',
            minlength:[5,'Минимальная длина сообщения для арбитража 5 символов'],
            maxlength:[3000,'Максимальная длина сообщения для арбитража 3000 символов'],

        },

        comment: {
            type: String,
            default: '',
            maxlength:[2000,'Максимальная длина комментария 2000 символов']
        },

        dateAccepted: {
            type: Date
        }
    });

    task.path('deadline').validate(function(v) {
        var min = new Date(+this._created+ 20*60000);
        var max = new Date(+this._created + 365*24*60*60000);
        var deadline = new Date(+v-3*60*60000);
        return min < deadline && deadline < max;
    },'Срок сдачи задания должен быть не меньше 15 минут и не больше года');

    task.statics.add = function(data, callback) {
        var Category = mongoose.model("Category");
        var task = new Task({
            header: data.header,
            description: data.description,
            price: data.price,
            category: data.category_id,
            deadline: new Date(data.deadline),
            _created: new Date(),
            status: "Поиск исполнителей"
        });
        task.save(function(err,task) {
           if (err) return callback(new HttpError(422,err.errors));
            else {
               Category.findOne({_id: task.category}, function (err, category) {
                   if (err) return callback(new HttpError(404, "Категория не найдена"));
                   category.incOrdersPerMonth();
                   category.save();
                   return callback(null, task);
               });
           }
        });
    };

    task.statics.get = function(regStatus,page,callback) {
        var tasksPerPage = config.get("tasksPerPage");
        Task.find({}).
            where('status').regex(regStatus).
            skip((page-1)*tasksPerPage).
            limit(tasksPerPage).
            sort({_created: -1}).
            populate('category').
            populate('author').
            populate('requests').
            exec(function(err,tasks) {
            if (err) return callback(err);
            return callback(null,tasks);
        })
    };
    task.statics.getAll = function(callback) {
        Task.find({}).populate('author').exec((err,tasks)=> {
            if (err) return callback(err);
            return callback(null,tasks);
        })
    };

    task.statics.getCount = (cb) => {
      Task.count({status: 'Поиск исполнителей'},(err,count)=> {
         if (err) return cb(err);
         return cb(null,count);
      });
    };

    task.statics.getMyCustomerTasks = function(user, callack) {
        Task.find({'author': user._id},'_id', function(err,mytasks) {
           if (err) return callack(err);
            return callack(null, mytasks);
        });
    };

    task.methods.edit = function(data,callback) {
        Object.keys(data).forEach((item)=> {
            this[item] = data[item];
        });
        return callback(null,this);
    };

    task.statics.getByRequest = function(request, callback) {
        Task.findOne({requests: request}, function (err, task) {
            if (err) return callback(err);
            if (!task) {
                return callback(new HttpError(404, "Задание не найдено"));
            }
            return callback(null, task);
        });
    };

    task.methods.removeTask = function(cb) {
        var self = this;
        Promise.all([self.removeFiles(),self.removeRequests(),self.removeMessages(),self.removeNotifications()]).then(()=> {
            Task.removeCollection([self]).then(()=> {
                cb(null,true);
            },()=> {

                cb(new HttpError(500,"Не удалось удалить задание"));
            });
        },
        (err)=> {
               cb(new HttpError(500,"Не удалось удалить задание"));
        });
    };

    task.methods.getRequestsPerTask = function() {
        var Request = mongoose.model("Request");
        var self = this;
        return new Promise(function(resolve,reject) {
            Request.find({_id: {$in: self.requests}},function(err) {
                if (err) reject(err);
            }).populate('executer','_id name').exec(function(err,requests) {
                if (err) reject(err);
                if (self.status!="Поиск исполнителей") {
                    requests = requests.filter((request)=> {
                        if (request.accepted) {
                            return request;
                        }
                    });
                }
                resolve({
                    task: {
                        _id: self._id,
                        header: self.header,
                        status: self.status,
                        deadline: self.deadline
                    },
                    requests: requests
                });
            });
        });
    };


    task.methods.removeFiles = function () {
      var promises = [];
      for(var i = 0; i<this.files.length; i++)
      {
          promises.push(this.removeFile(__dirname + "/../public/uploads/" + this.files[i].name))
      }
      return  Promise.all(promises);
    };

    task.methods.removeFile = function(path) {
        return new Promise(function(resolve,reject) {
            fs.unlink(path, (err)=> {
                err?reject(err):resolve();
            })
        });
    };

    task.methods.removeRequests = function() {
        var self = this;
        var Request = mongoose.model("Request");
        return new Promise((resolve,reject)=> {
            Request.find({_id: {$in: self.requests}},function(err, requests) {
               err? reject(err): resolve(requests);
            })
        }).then((result)=> {
            return Task.removeCollection(result);
        },()=> {
        });
    };

    task.methods.removeMessages = function() {
        var self = this;
        var Message = mongoose.model("Message");
        return new Promise((resolve,reject)=> {
            Message.find({task: self._id}, (err, messages) => {
                err? reject(err): resolve(messages);
            });
        }).then((result)=> {
            return Task.removeCollection(result);
        }, ()=> {
        });
    };

    task.methods.removeNotifications = function() {
        var self = this;
        var Notification = mongoose.model("Notification");
        return new Promise((resolve,reject)=> {
            Notification.find({task: self._id}, (err, notifications) => {
                err? reject(err): resolve(notifications);
            });
        }).then((result)=> {
            return Task.removeCollection(result);
        },()=> {
        });
    };


    task.statics.removeCollection = (collection) => {
        return Promise.all(collection.map((item)=> {
            return new Promise((resolve,reject)=>
            {
                item.remove((err)=> {
                    err ? reject(err) : resolve();
                });
            });
        }));
    };

    task.statics.getByCustomerId = function(id,callback) {
            Task.find({author: id}, (err,tasks) => {
                if (err) return callback(err);
                return callback(null, tasks);
            })
    };

    task.methods.addDispute = function(dispute,callback) {
        this.dispute = dispute;
        this.status = "Арбитраж";
        var self = this;
        this.save(function(err){
            if (err) return callback(new HttpError(422,err.errors));
            self.changeStatus();
            return callback(null,this);
        });
    };

    task.methods.addComment = function(comment,callback) {
        this.comment = comment;
        this.status = "Выполнено";
        this.dateAccepted = new Date();
        var self = this;
        this.save(function(err){
            if (err) return callback(new HttpError(422,err.errors));
            return callback(null,self);
        });
    };

    task.methods.findExecuter = function(callback) {
        var self = this;
        var Request = mongoose.model('Request');
        Request.find({_id: {$in: self.requests}},function(err) {
            if (err) return callback(err);
        }).where('accepted','true').populate('executer','_id').exec(function(err,requests) {
                if (err) return callback(err);
                return callback(null,requests[0].executer);
        });
    };

    task.methods.changeStatus = function() {
        var socket = io.connect('ws://localhost:3000', {reconnect: true});
        console.log('2');
// Add a connect listener
        socket.on('connect', function(socket) {
            console.log('Connected!');
        });
        socket.emit('notific message',this);
    };

    Task = module.exports = mongoose.model("Task",task);