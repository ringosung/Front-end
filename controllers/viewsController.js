const Tour = require('../models/tourModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const User = require('../models/userModel')
const Booking = require('../models/bookingModel')

    exports.getOverview = catchAsync(async (req, res, next) => {
        // 1) Get tour data from collection
        const tours = await Tour.find();
      
        // 2) Build template
        // 3) Render that template using tour data from 1)
        res.status(200).render('overview', {
          title: 'All Tours',
          tours
        });
      });

     exports.getTour = catchAsync(async (req, res, next) => {
        // 1) Get the data, for the requested tour (including reviews and guides)
        const tour = await Tour.findOne({ slug: req.params.slug }).populate({
          path: 'reviews',
          fields: 'review rating user'
        });

        if(!tour){
            return next(new AppError('no such tour', 404))
        }
    // 2) Build template

    // 3) Render that template using tour data from 1)
    res.status(200).render('tour', {
        title: `${tour.name}`, 
        tour
    })
})

exports.getLoginForm = (req, res) => {
    // res.status(200).render('login', {
    //     title: 'Log into your account'
    // })
    res
    .status(200)
    .set(
        'Content-Security-Policy',
        "connect-src 'self' https://cdnjs.cloudflare.com"
    )
    .render('login', {
        title: 'Log into your account',
    });
}

exports.getAccount = (req, res) => {
    res.status(200).render('account', {
        title: 'Your Account'
    });
}

exports.getMyTours = catchAsync(async(req, res, next) => {
    // 1) Find all bookings
    const bookings = await Booking.find({ user: req.user.id })

    // 2) Find tours with the returned IDs
    const tourIDs = bookings.map(el => el.tour);
    const tours = await Tour.find({ _id: { $in: tourIDs }});

    res.status(200).render('overview', {
        title: 'My Tours',
        tours
    })
})

exports.getSignUpForm = (req, res) => {
    res.status(200).render('signup', {
      title: `Create New Account`,
    });
  };

exports.deleteTour = catchAsync(async (req, res, next) => {
    // 1) Get tour data from collection
    const tours = await Tour.find();
  
    // 2) Build template
    // 3) Render that template using tour data from 1)
    res.status(200).render('deleteTour', {
      title: 'Delete Tour',
      tours
    });
  });

  exports.newDog = (req, res) => {
    res.status(200).render('newDog', {
      title: `Add new dog`,
    });
  };

