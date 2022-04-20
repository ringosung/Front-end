const {promisify} = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
}

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirmation: req.body.passwordConfirmation,
        passwordChangedAt: req.body.passwordChangedAt
    });

    const token = signToken(newUser._id);

    res.status(201).json({
        status: 'success',
        token,
        data: {
            user: newUser
        }
    })
});

exports.login = catchAsync(async (req, res, next) => {
    const {email, password} = req.body;
// 1) Check if email and password exists
    if(!email || !password) {
        return next(new AppError('Please enter email and password', 400))
    }

    
    // 2) Check if user exists && password is correct
    const user = await User.findOne({email}).select('+password');
    
    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401));
      }

    // 3) If everything ok, send token to client
    const token = signToken(user._id);
    res.status(200).json({
        status: 'success',
        token
    })
})

exports.protect = catchAsync(async (req, res, next) => {
    // 1) Get the token 
    let token;
    if(req.headers.authorization && 
        req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    }

    if(!token){
        return next(new AppError('You are not authorized to access'));
    }
    // 2) Check if the token is valid
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
    
    // 3) Check if user is exists
    const freshUser = await User.findById(decoded.id);
    if(!freshUser){
        return next(new AppError('user no longer exists', 401));
    }

    // 4) check if the user changed password
    if(freshUser.changedPasswordAfter(decoded.iat)){
        return next(new AppError('user changed password', 401));
    }

    // only can go next if no error happened
    req.user = freshUser;
    next();
});