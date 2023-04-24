'use strict';
const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: String,
    password: String,
    email: {
        type: String,
        unique: true
    },
    status: Number,
    create_time: String,
})


const User = mongoose.model('User', userSchema);


module.exports = User;