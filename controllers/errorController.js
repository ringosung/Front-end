const AppError = require('./../utils/appError')

const handleCasterrorDB = err => {
    const message = `Invalid ${err.path}:${err.value}.`
    return new AppError(message, 400)
}

const handleDuplicateFieldsDB = err => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    console.log(value)
    const message = `Duplicate field value: ${value}. Please use another value`
    return new AppError(message, 400);
}
const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    });
};

const sendErrorProd = (err, res) => {
    //Operational error
    if (err.isOperational){
        res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
    });

    // Programming error
    } else {

        // Log error
        console.error('error', err)

        // send general error message
        res.status(500).json ({
            status: 'error',
            message: 'error'
        })
    }
};

const handleJWTError = () => new AppError('Invalid JWT. Please try again', 401)
const handleJWTExpiredError = () =>  new AppError('Your token has expired! Please log in again.', 401);
module.exports = (err, req, res, next) => {
    
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if(process.env.NODE_ENV === 'development'){
        sendErrorDev(err, res)
    } else if (process.env.NODE_ENV === 'production'){
        let error = Object.create(err);;
        
        if(error.name === 'Casterror') error = handleCasterrorDB(error);
        if(error.code === 11000) error = handleDuplicateFieldsDB(error);
        if(error.name === 'ValidationError') error = handleValidationErrorDB(error);
        if(error.name === 'JsonWebTokenError') error = handleJWTError();
        if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

       sendErrorProd(error, res)
    }
};
