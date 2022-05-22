const Dog = require('../models/dogModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const User = require('../models/userModel')
const Booking = require('../models/bookingModel')

    exports.getOverview = catchAsync(async (req, res, next) => {
        // 1) Get dog data from collection
        const dogs = await Dog.find();
      
        // 2) Build template
        // 3) Render that template using dog data from 1)
        res.status(200).render('overview', {
          title: 'All Dogs',
          dogs
        });
      });

     exports.getDog = catchAsync(async (req, res, next) => {
        // 1) Get the data, for the requested dog (including reviews and guides)
        const dog = await Dog.findOne({ slug: req.params.slug }).populate({
          path: 'reviews',
          fields: 'review rating user'
        });

        if(!dog){
            return next(new AppError('no such dog', 404))
        }
       // 2) Render that template using dog data from 1)
    res.status(200).render('dog', {
        title: `${dog.name}`, 
        dog
    })
})

exports.getLoginForm = (req, res) => {

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

exports.getMyDogs = catchAsync(async(req, res, next) => {
    // 1) Find all bookings
    const bookings = await Booking.find({ user: req.user.id })

    // 2) Find dogs with the returned IDs
    const dogIDs = bookings.map(el => el.dog);
    const dogs = await Dog.find({ _id: { $in: dogIDs }});

    res.status(200).render('overview', {
        title: 'My Dogs',
        dogs
    })
})

exports.getSignUpForm = (req, res) => {
    res.status(200).render('signup', {
      title: `Create New Account`,
    });
  };

exports.deleteDog = catchAsync(async (req, res, next) => {
    // 1) Get dog data from collection
    const dogs = await Dog.find();
  
    // 2) Build template
    // 3) Render that template using dog data from 1)
    res.status(200).render('deleteDog', {
      title: 'Delete Dog',
      dogs,
      
    })
    window.setTimeout(() => {
        location.assign('/');
    }, 1500)
    next();
  });

  exports.newDog = (req, res) => {
    res.status(200).render('newDog', {
      title: `Add new dog`,
    });
  };

exports.deleteDogDetail = catchAsync(async (req, res, next) => {
    // 1) Get the data, for the requested dog (including reviews and guides)
    const dog = await Dog.findOne({ slug: req.params.slug }).populate({
      path: 'reviews',
      fields: 'review rating user'
    });

    if(!dog){
        return next(new AppError('no such dog', 404))
    }
// 2) Build template

// 3) Render that template using dog data from 1)
res.status(200).render('deleteDogDetail', {
    title: `${dog.name}`, 
    dog
})
})

exports.updateDog = (req, res) => {
  res.status(200).render('updateDog', {
    title: `Create New Account`,
  });
};