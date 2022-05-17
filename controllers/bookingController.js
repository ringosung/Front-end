const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync')
const factory = require('../controllers/handlerFactory')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const Booking = require('../models/bookingModel')

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
    // 1) Get the currently booked tourModel
const tour = await Tour.findById(req.params.tourId)

    // 2) create checkout session
const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tour=${
        req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
        {
            name: `${tour.name}`,
            description: tour.summary,
            images:['https://images.dog.ceo/breeds/tervuren/ow_and_frisbee.jpg'], 
            amount: 100,
            currency: 'usd',
            quantity: 1
        }
    ]
})

    // 3) Create session as response
    res.status(200).json({
        status: 'success',
        session
    });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
    const {tour, user, price} = req.query;

    if(!tour || !user || !price) return next();
    await Booking.create({tour, user, price});

    res.redirect(req.originalUrl.split('?')[0]);
});
