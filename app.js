
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean')
const hpp = require('hpp')

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

// Start express app
const app = express();

// 1) Global middlewares
// set security HTTP headers
app.use(helmet())

// Development logging
if(process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Limit requests from user
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, please try again later.' 
});

app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());


// Data sanitization against XSS
app.use(xss())

// Provent parameter pollution
app.use(hpp({
    whitelist: ['duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price']
}
))

//Serving static files
app.use(express.static(`${__dirname}/public`))

// testing middlewares
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    //console.log(req.headers)
    next();
})

/* app.get('/', (req, res) => {
    res.status(200).
    json({message: 'Hello from the server side', app: 'Natours'});
});

app.post('/', (req, res) => {
    res.send('You can post to this endpoint...');
}) */




/* app.get('/api/v1/tours', getAllTours);
app.get('/api/v1/tours/:id', getTour);
app.post('/api/v1/tours', createTour);
app.update('/api/v1/tours/:id', updateTour);
app.delete('/api/v1/tours/:id', deleteTour); */

// 3) Routes



app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/reviews', reviewRouter)

app.all('*', (req, res, next) => {
    next(new AppError(`can't find ${req.originalUrl} on this server`, 404));
})


// express error handling
app.use(globalErrorHandler)

// 4) start the server

module.exports = app;
