const crypto = require('crypto');
const {promisify} = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');


const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
}

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    const cookieOptions = {
        expires: new Date(
          Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
      };
      if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
    
      res.cookie('jwt', token, cookieOptions);
    
      // Remove password from output
      user.password = undefined;
    
      res.status(statusCode).json({
        status: 'success',
        token,
        data: {
          user
        }
      });
    };

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirmation: req.body.passwordConfirmation,
        passwordChangedAt: req.body.passwordChangedAt,
        role: req.body.role
    });

    createSendToken(newUser, 201, res);

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
    createSendToken(User, 200, res);
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

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
      // roles ['admin', 'lead-guide']. role='user'
      if (!roles.includes(req.user.role)) {
        return next(
          new AppError('You do not have permission to perform this action', 403)
        );
      }
  
      next();
    };
  };

exports.forgotPassword = catchAsync(async(req, res, next) => {
    
    // 1) get user based on the email they provided
    const user = await User.findOne({email: req.body.email})
    if(!user){
        return next(new AppError('There is no user with that email', 404));
    }
    
    // 2) create a reset token 
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3) send the reset token to the user's email address
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`

    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

    try {
        await sendEmail({
          email: user.email,
          subject: 'Your password reset token (valid for 10 min)',
          message
        });
    
        res.status(200).json({
          status: 'success',
          message: 'Token sent to email!'
        });
      } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
    
        return next(
          new AppError('There was an error sending the email. Try again later!'),
          500)

    }
   
});

exports.resetPassword = catchAsync(async(req, res, next) => {
    // 1) get user based on password reset token

    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({passwordResetToken: hashedToken, passwordResetExpires: {$gt: Date.now()}})

    // 2) If the token is valid, set new password
    if (!user){
        return next(new AppError('Token is invalid or expired', 400))
    }
    user.password = req.body.password;
    user.passwordConfirmation = req.body.passwordConfirmation;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();


    // 3) Update changedPasswordAt in user database


    // 4) send JWT and login the user
    createSendToken(User, 200, res);

})

exports.updatePassword = catchAsync(async(req, res, next) => {
    // 1) get user from database
    const user = await User.findById(req.user.id).select('+password');

    // 2) check if user's input password is correct
    if(!(await user.correctPassword(req.body.passwordCurrent, user.password)))
        return next(new AppError('Your current password is incorrect'), 401);
    // 3) update the password 

    user.password = req.body.password;
    user.passwordConfirmation = req.body.passwordConfirmation;
    await user.save();


    // 4) send JWT and login the user
    createSendToken(User, 200, res);
})