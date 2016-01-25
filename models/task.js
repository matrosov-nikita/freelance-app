var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var HttpError = require('../error/http_error');

var task = new Schema({

    header: {
        type: String,
        required: true,
        minlength: [3,'Минимальная длина заголовка 10 символов'],
        maxlength:[70,'Максимальная длина заголовка 70 символов']
    },

    price: {
        type: Number,
        required: true,
        min: [100,'Минимальная стоимость задания 100 рублей'],
        max: [100000,'Максимальная стоимость задания 100000 рублей']
    },

    category: {
        type: Schema.Types.ObjectId, ref: 'Category'
    },

    description: {
        type: String,
        required: true,
        minlength: [20,'Минимальная длина описания задания 20 символов'],
        maxlength:[400,'Максимальная длина описания задания 400 символов']
    },

    deadline: {
        type: Date
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
        message: String,
        files:
            [{
                name: String,
                original: String
            }]
    }

});


task.statics.add = function(data, callback) {
    var Category = mongoose.model("Category");
    var task = new Task({
        header: data.header,
        description: data.description,
        price: data.price,
        category: data.category_id,
        deadline: new Date(data.deadline),
        _created: new Date()
    });
    task.save(function(err,task) {
       if (err) callback(err);
        else {
           Category.findOne({_id: task.category}, function (err, category) {
               if (err) return callback(new HttpError(404, "Категория не найдена"));
               category.incOrdersPerMonth();
               category.save();
           });
           return callback(null, task);
       }
    });
};
task.statics.get = function(user, callback) {
    Task.find({}).
        where('status').equals("Поиск исполнителей").
        sort({_created: -1}).
        populate('category').
        populate('author').
        exec(function(err,tasks) {
       if (err) return callback(err);
        return callback(null,tasks);
    })
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

task.methods.getRequestsPerTask = function() {
    var Request = mongoose.model("Request");
    var self = this;
    return new Promise(function(resolve,reject) {
        Request.find({_id: {$in: self.requests}},function(err) {
            if (err) reject(err);
        }).populate('executer','_id name').exec(function(err,requests) {
            if (err) reject(err);
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

Task = module.exports = mongoose.model("Task",task);