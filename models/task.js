var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var task = new Schema({

    header: {
        type: String
    },

    price: {
        type: Number
    },

    category: {
        type: Schema.Types.ObjectId, ref: 'Category'
    },

    description: {
        type: String
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

    requests: {
        type: [Schema.Types.ObjectId], ref: 'Request'
    }
});


task.statics.add = function(data, callback) {
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
        else
       callback(null,task);
    });
};
task.statics.get = function(callback) {
    Task.find({}).
        sort({_created: -1}).
        populate('category').
        populate('author').
        exec(function(err,tasks) {
       if (err) callback(err);
        callback(null,tasks);
    })

};


Task = module.exports = mongoose.model("Task",task);