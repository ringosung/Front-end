const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A user must have a name'],
        unique: true
    },
    email:{
        type: String,
        required: [true, 'A user must have a email'],
        unique: true,
        lowercase: true,
        trim: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    }, 
    photo: String,
    password: {
        type: String,
        required: [true, 'Please enter password'],
        minlength: 8
    },
    passwordConfirmation: {
        type: String,
        required: [true, 'Please enter password confirmation']
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;