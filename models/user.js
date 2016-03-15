
    var mongoose = require('mongoose');
    var crypto = require('crypto');
    var HttpError = require('../error/http_error');
    var Schema = mongoose.Schema;

    var userSchema = new Schema({
        name: {
            type: String,
            required: true,
            minlength: [3,'Минимальная длина имени 3 символа'],
            maxlength:[70,'Максимальная длина имени 70 символов']
        },
        hashedPassword: {
            type: String,
            required: true
        },
        login: {
            type: String,
            unique: true,
            required: true,
            minlength: [3,'Минимальная длина логина 3 символа'],
            maxlength:[70,'Максимальная длина логина 70 символов'],
            match: /^[a-zA-Z0-9-_]{3,70}$/
        },
        email: {
            type: String,
            unique: true,
            required: true,
            match: [/([a-z0-9_-]+\.)*[a-z0-9_-]+@[a-z0-9_-]+(\.[a-z0-9_-]+)*\.[a-z]{2,6}/,"Некорректный email"]
        },
        marks: {
            positive: { type: Number, default: 0},
            neitral:  { type: Number, default: 0} ,
            negative: { type:  Number, default: 0}
        },
        created:
        {
            type: Date,
            default: Date.now
        },
        about:
        {
            type: String,
            maxlength:[150,'Максимальная длина информации об имени 150 символов']
        },
        salt: {
            type: String,
            required: true
        },
        _hash: {
            type: String,
            default:0
        },
        confirmEmail: {
            type: Boolean,
            default: false
        },
        rating:  {
            type: Number,
            default: 0
        },

        works: [Schema.Types.ObjectId],

        role: {
            type: String,
            enum: ["Администратор","Пользователь"]
        }
    });

    userSchema.methods.encryptPassword = function(password) {
        return crypto.createHmac('sha1',this.salt).update(password).digest('hex');
    };
    userSchema.methods.checkPassword = function(password) {
        return this.encryptPassword(password) == this.hashedPassword;
    };
    userSchema.virtual('password').set(function(password) {
       this.salt = Math.random() + '';
       this.hashedPassword = this.encryptPassword(password);
    });

    userSchema.statics.getAll = function(cb) {
        User.find({}, (err,users)=> {
            if (err) return cb(err);
            return cb(null,users);
        })
    };

    userSchema.methods.getOrdersCount = function() {
        var self = this;
        return new Promise(function(resolve,reject)
        {
            var Task = mongoose.model('Task');
            Task.count({author:self._id}, (err,count)=> {
                if (err)  reject(err);
                resolve(count);
            });
        });
    };

    userSchema.methods.getExecuterCount = function() {
        var self = this;
        return new Promise(function(resolve,reject)
        {
            var count = 0;
            var Request = mongoose.model('Request');
            Request.find({executer: self._id, accepted: true},(err)=> {
              if (err) reject(err);
            }).populate('task').exec((err,requests)=> {
                if (err) reject(err);
                requests.forEach((request)=> {
                    console.log(request.task.status);
                    if (request.task.status=="Выполнено") count+=1;
                });
                resolve(count);
            });
        });
    };

    userSchema.statics.register = function(data, callback) {
        this.findOne({login: data.login}, function(err, user) {
            if (err) return callback(err);
            if (user) {
                return callback(new HttpError(403,"Пользователь с таким логином уже существует"));
            }
            else {
                var user = new User();
                for(var item in data) {
                   user[item] = data[item];
                }
                var hash = Math.random().toString(36).slice(2);
                user._hash = hash;
                user.save(function(err, user) {
                    if (err) return callback(new HttpError(422,err.errors));
                    else {
                        return callback(null,user);
                    }
                });
            }
        });
    };

    userSchema.statics.authorize = function(login,password, callback) {
        this.findOne({login: login}, function(err, user) {
            if (err) return callback(err);
            if (!user) {
               return  callback(new HttpError(403, "Пользователя с таким логином не существует"));
            }
            else {
                if (user.checkPassword(password) && user.confirmEmail)
                {
                    return callback(null,user);
                }
                else {
                    return callback(new HttpError(403,"Неверный пароль"));
                }
            }
        });
    };

    userSchema.methods.getWorks = function(callback) {
        var Portfolio = mongoose.model('Portfolio');
        Portfolio.find({_id: {$in: this.works}}, function(err,works){
            if (err) return callback(err);
            return callback(null,works);
        });
    };

    userSchema.methods.getTasks = function(callback){
        var Task = mongoose.model("Task");
        Task.find({author: this._id}, function(err,tasks){
            if (err) return callback(err);
            return callback(null,tasks);
        });
    };

    userSchema.methods.getAllRequests = function(callback) {
          var promises = [];
          this.getTasks(function(err,tasks) {
              if (err) return callback(err);
              tasks.forEach(function(task) {
                  promises.push(task.getRequestsPerTask());
              });
              Promise.all(promises).then(
                  requests => callback(null, requests),
                  err => callback(err)
              );
          });
    };

    userSchema.methods.getOwnRequests = function(callback) {
        var Request = mongoose.model('Request');
        Request.find({executer: this._id}, function(err) {
            if (err) return callback(err);
        }).populate('task','_id header status').exec(function(err,requests) {
            if (err) return callback(err);
            return callback(null, requests);
        });
    };

    userSchema.methods.edit = function(date,callback) {
        if (date._id != this._id) return callback(new HttpError(403,"Недостаточно прав"));
            for (var item in date) {
               if (item!='_id') {
                   this[item] = date[item];
               }
            }
            this.save(function(err) {
                if (err) return callback(err);
                return callback(null,this);
            });
    };


   var User =  module.exports = mongoose.model('User',userSchema);
