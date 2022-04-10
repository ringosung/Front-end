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
module.exports = (err, req, res, next) => {
    
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if(process.env.NODE_ENV === 'development'){
        sendErrorDev(err, res)
    } else if (process.env.NODE_ENV === 'production'){
        let error = {...err};
        
        if(error.name === 'Casterror') error = handleCasterrorDB(error)
        if(error.code === 11000) error = handleDuplicateFieldsDB(error)

       sendErrorProd(error, res)
    }
};
