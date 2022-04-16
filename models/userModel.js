const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

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
        required: [true, 'Please enter password confirmation'],
        validate:{
            validator: function(el) {
                return el === this.password;
            },
            message: 'password is not the same'
        }
    }
});

userSchema.pre('save', async function(next) {
    //Only run this function if password was actually modified
    if(!this.isModified('password')) return next();

    this.password = await bcrypt.hash('this.password', 12);

    //Delete passwordConfirm field
    this.passwordConfirm = undefined;
    next();
})

const User = mongoose.model('User', userSchema);

module.exports = User;