const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const FoodSchema = Schema({
    name:{
        type:String,
        required:true
    },
   description:{
        type:String
    },
    price:{
        type:Number,
        required:true
    },
    calories:{
        type:Number
    },
    protein:{
        type:Number
    },
    carbs:{
        type:Number
    },
    fat:{
        type:Number
    },
    category:{
        type:String,
        enum:['Protein','LowCalorie','HealthySnack','Supplement']
    },
    image:{
        type:String
    },
    inStock:{
        type:Boolean,
        default:true
    }

},{timestamps:true});
module.exports = mongoose.model('Food',FoodSchema);