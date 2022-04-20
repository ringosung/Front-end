
const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

// Start express app
const app = express();

// 1) middlewares
if(process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}


app.use(express.json());
app.use(express.static(`${__dirname}/public`))


app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    console.log(req.headers)
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

app.all('*', (req, res, next) => {
    next(new AppError(`can't find ${req.originalUrl} on this server`, 404));
})


// express error handling
app.use(globalErrorHandler)

// 4) start the server

module.exports = app;
