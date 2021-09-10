
const mongoose = require('mongoose');

let UsersSchemas = mongoose.Schema({
    email: {
        type : String,
        required : true 
    },
    password:{
        type : String,
        required : true
    },
    name:{
        type : String,
        required : true
    },
    rank:{
        type :Number,
        required : true
    },
    joined : {
        type : Date,
        required : false
    }


});

module.exports = UsersSchemas = mongoose.model('users',UsersSchemas);