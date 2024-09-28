const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require("./review.js");
const User = require("./user.js");

const complainSchema = new Schema({
    complain: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    imageURL: {
        url: String,
        filename: String
    },
    severity:{
        type:String
    },
    reviews : [
        {type: Schema.Types.ObjectId ,
        ref: "Review",},
     ],

     expressusers:[
        {type: Schema.Types.ObjectId ,
            ref: "User",
        }
     ],

     supportCount: {
        type: Number,
        default: 0, // Initialize support count to 0
    },
    
},{timestamps: true});

const complainModel = mongoose.model('Complain', complainSchema);

module.exports = complainModel;