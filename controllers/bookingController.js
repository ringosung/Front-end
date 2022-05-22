const Dog = require('../models/dogModel');
const catchAsync = require('../utils/catchAsync')
const factory = require('../controllers/handlerFactory')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const Booking = require('../models/bookingModel')

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
    // 1) Get the currently booked dogModel
const dog = await Dog.findById(req.params.dogId)

    // 2) create checkout session
const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?dog=${
        req.params.dogId}&user=${req.user.id}&price=${dog.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/dog/${dog.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.dogId,
    line_items: [
        {
            name: `${dog.name}`,
            description: dog.summary,
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
    const {dog, user, price} = req.query;

    if(!dog || !user || !price) return next();
    await Booking.create({dog, user, price});

    res.redirect(req.originalUrl.split('?')[0]);
});

