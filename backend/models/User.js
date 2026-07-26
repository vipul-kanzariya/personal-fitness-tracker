const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    age:{
        type:Number
    },
    weight:{
        type:Number
    },
    height:{
        type:Number
    },
    role:{
        type:String,
        enum:['admin','user'],
        default:'user'
    },
    isBlocked:
    { 
        type:Boolean,
        default:false
    }
},{timestamps:true});
module.exports = mongoose.model('User',UserSchema);