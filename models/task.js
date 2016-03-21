var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var HttpError = require('../error/http_error');

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
            required: [true,'Срок сдачи задания обязателен для заполнения'],
            validate: [dateValidator, 'Срок сдачи задания должен быть не меньше 15 минут и не больше года']
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
        message: { type: String, default: '' },
        files:
            [{
                name: String,
                original: String
            }]
    },

    dispute: {
        type: String,
        default: ''
    },

    comment: {
        type: String,
        default: ''
    }
});

function dateValidator(value) {
    var min = new Date(+new Date + 20*60000);
    var max = new Date(+new Date + 365*24*60*60000);
    var deadline = new Date(+value-3*60*60000);
    return min < deadline && deadline < max;
}

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
       if (err) return callback(err.errors);
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

task.statics.get = function(regStatus,callback) {
    Task.find({}).
        where('status').regex(regStatus).
        sort({_created: -1}).
        populate('category').
        populate('author').
        populate('requests').
        exec(function(err,tasks) {
       if (err) return callback(err);
        return callback(null,tasks);
    })
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


task.statics.getByCustomerId = function(id,callback) {
        Task.find({author: id}, (err,tasks) => {
            if (err) return callback(err);
            return callback(null, tasks);
        })
};
task.methods.addDispute = function(dispute,callback) {
    this.dispute = dispute;
    this.status = "Арбитраж";
    this.save(function(err){
        if (err) return callback(new HttpError(422,err.errors));
        return callback(null,this);
    });
};

task.methods.addComment = function(comment,callback) {
    this.comment = comment;
    this.status = "Выполнено";
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

Task = module.exports = mongoose.model("Task",task);