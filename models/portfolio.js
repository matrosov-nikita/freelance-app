var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var portfolio = new Schema({
    name: {
        type: String,
        minlength: [5,'Минимальная длина названия работы 5 символов'],
        maxlength:[50,'Максимальная длина названия работы 50 символов']
    },

    description: {
        type: String,
        minlength: [10,'Минимальная длина описания работы 10 символов'],
        maxlength:[250,'Максимальная длина описания работы 250 символов']
    },

    files:
        [{
            name: String,
            original: String
        }]
});


module.exports = mongoose.model("Portfolio",portfolio);