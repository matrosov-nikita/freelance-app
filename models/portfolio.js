var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var portfolio = new Schema({
    name: {
        type: String
    },
    description: {
        type: String
    },
    files:
        [{
            name: String,
            original: String
        }]
});


module.exports = mongoose.model("Portfolio",portfolio);