const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('./../controllers/authController');
const bookingController = require('./../controllers/bookingController')


const router = express.Router();


router.get('/', bookingController.createBookingCheckout, authController.isLoggedIn, viewsController.getOverview);
router.get('/dog/:slug', authController.isLoggedIn, viewsController.getDog);
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
router.get('/me', authController.protect, viewsController.getAccount);
router.get('/signup', viewsController.getSignUpForm);
router.get('/deleteDog', authController.isLoggedIn, viewsController.deleteDog);
router.get('/deleteDogDetail/:slug', authController.isLoggedIn, viewsController.deleteDogDetail);
router.get('/newDog', authController.isLoggedIn, viewsController.newDog);
router.get('/my-dogs', authController.protect, viewsController.getMyDogs)

module.exports = router;

