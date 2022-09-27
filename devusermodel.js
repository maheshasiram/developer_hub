const mongoose = require('mongoose');

const devuser = new mongoose.Schema({
    fullname: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    skill: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    confirmpassword: {
        type: String,
        require: true
    },

})

module.exports = mongoose.model('devuser', devuser);