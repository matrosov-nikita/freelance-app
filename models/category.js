var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var category = new Schema({
   name: {
       type: String
   },
   parent: {
       type: String
   },
   ordersPerMonth: {
       type: Number,
       default: 0
   }
});

category.statics.getList = function(callback) {
    this.find({}, function(err,categories) {
            if (err) return callback(err);
            return callback(null,categories);
    });
};

category.methods.incOrdersPerMonth = function() {
    this.ordersPerMonth+=1;
};

var Category = module.exports = mongoose.model("Category",category);