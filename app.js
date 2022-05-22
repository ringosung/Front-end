const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const csp = require('express-csp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const dogRouter = require('./routes/dogRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes')



// Start express app
const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'))


// 1) Global middlewares
//Serving static files
app.use(express.static(path.join(__dirname, 'public')))

// set security HTTP headers
app.use(helmet());
csp.extend(app, {
  policy: {
    directives: {
      'default-src': ['self'],
      'style-src': ['self', 'unsafe-inline', 'https:'],
      'font-src': ['self', 'https://fonts.gstatic.com'],
      'script-src': [
        'self',
        'unsafe-inline',
        'data',
        'blob',
        'https://js.stripe.com',
        'https://*.mapbox.com',
        'https://*.cloudflare.com/',
        'https://bundle.js:8828',
        'ws://localhost:56558/',
      ],
      'worker-src': [
        'self',
        'unsafe-inline',
        'data:',
        'blob:',
        'https://*.stripe.com',
        'https://*.mapbox.com',
        'https://*.cloudflare.com/',
        'https://bundle.js:*',
        'ws://localhost:*/',
      ],
      'frame-src': [
        'self',
        'unsafe-inline',
        'data:',
        'blob:',
        'https://*.stripe.com',
        'https://*.mapbox.com',
        'https://*.cloudflare.com/',
        'https://bundle.js:*',
        'ws://localhost:*/',
      ],
      'img-src': [
        'self',
        'unsafe-inline',
        'data:',
        'blob:',
        'https://*.stripe.com',
        'https://*.mapbox.com',
        'https://*.cloudflare.com/',
        'https://bundle.js:*',
        'ws://localhost:*/',
      ],
      'connect-src': [
        'self',
        'unsafe-inline',
        'data:',
        'blob:',
        'wss://<HEROKU-SUBDOMAIN>.herokuapp.com:<PORT>/',
        'https://*.stripe.com',
        'https://*.mapbox.com',
        'https://*.cloudflare.com/',
        'https://bundle.js:*',
        'ws://localhost:*/',
      ],
    },
  },
});

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
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());


// Data sanitization against XSS
app.use(xss())

// Provent parameter pollution
app.use(hpp({
    whitelist: ['duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price']
}
))



// testing middlewares
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
})


/* app.get('/api/v1/dogs', getAllDogs);
app.get('/api/v1/dogs/:id', getDog);
app.post('/api/v1/dogs', createDog);
app.update('/api/v1/dogs/:id', updateDog);
app.delete('/api/v1/dogs/:id', deleteDog); */

// 3) Routes


app.use('/', viewRouter);
app.use('/api/v1/dogs', dogRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/reviews', reviewRouter)
app.use('/api/v1/bookings', bookingRouter)

app.all('*', (req, res, next) => {
    next(new AppError(`can't find ${req.originalUrl} on this server`, 404));
})


// express error handling
app.use(globalErrorHandler)

// 4) start the server

module.exports = app;
