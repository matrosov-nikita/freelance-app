
    var mongoose = require('mongoose');
    var crypto = require('crypto');
    var HttpError = require('../error/http_error');
    var Schema = mongoose.Schema;

    var userSchema = new Schema({
        name: {
            type: String,
            required: true
        },
        hashedPassword: {
            type: String,
            required: true
        },
        login: {
            type: String,
            unique: true,
            required: true
        },
        email: {
            type: String,
            unique: true,
            required: true
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
            type: String
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

        works: [Schema.Types.ObjectId]
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

    userSchema.statics.register = function(data, callback) {
        this.findOne({login: data.login}, function(err, user) {
            if (err) return callback(err);
            if (user) {
                callback(new HttpError(403,"Пользователь с такими данными уже существует"));
            }
            else {
                var user = new User();
                for(var item in data) {
                   user[item] = data[item];
                }
                var hash = Math.random().toString(36).slice(2);
                user._hash = hash;
                user.save(function(err, user) {
                    if (err) return callback(err);
                    else {
                        callback(null,user);
                    }
                });
            }
        });
    };

    userSchema.statics.authorize = function(login,password, callback) {
        this.findOne({login: login}, function(err, user) {
            if (err) return callback(err);
            if (!user) {
                callback(new HttpError(403, "Пользователя с таким логином не существует"));
            }
            else {
                if (user.checkPassword(password) && user.confirmEmail)
                {
                    callback(null,user);
                }
                else {
                    callback(new HttpError(403,"Неверный пароль"));
                }
            }
        });
    };

    userSchema.methods.getWorks = function(callback) {
        var Portfolio = mongoose.model('Portfolio');
        Portfolio.find({_id: {$in: this.works}}, function(err,works){
            if (err) callback(err);
            callback(null,works);
        });
    };

    userSchema.methods.edit = function(date,callback) {
            for (var item in date) {
               if (item!='_id') {
                   this[item] = date[item];
               }
            }
            this.save(function(err) {
                if (err) return callback(err);
                callback(null,this);
            });
    };



   var User =  module.exports = mongoose.model('User',userSchema);
