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
            if (err) callback(err);
            callback(null,categories);

    });
};
var Category = module.exports = mongoose.model("Category",category);