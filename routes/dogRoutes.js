const express = require('express')
const dogController = require('./../controllers/dogController')
const router = express.Router();
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');

// router.param('id', dogController.checkID);



router.use('/:dogId/reviews', reviewRouter);

router
    .route('/dog-stats')
    .get(dogController.getDogStats);


    router
    .route('/monthly-plan/:year')
    .get(
        authController.protect,
        authController.restrictTo('admin', 'lead-guide', 'guide'), 
        dogController.getMontylyPlan
        );

router
    .route('/top-5-dogs')
    .get(dogController.aliasTopDogs, dogController.getAllDogs)

    router
    .route('/dogs-within/:distance/center/:latlng/unit/:unit')
    .get(dogController.getDogsWithin);
  // /dogs-within?distance=233&center=-40,45&unit=mi
  // /dogs-within/233/center/-40,45/unit/mi
  
  router.route('/distances/:latlng/unit/:unit').get(dogController.getDistances);

router
    .route('/')
    .get(dogController.getAllDogs)
    .post(
        authController.protect,
        authController.restrictTo('admin', 'lead-guide'), 
        dogController.createDog
        );

router
    .route('/:id')
    .get(dogController.getDog)
    .patch(
        authController.protect,
        authController.restrictTo('admin', 'lead-guide'),
        dogController.uploadDogImages,
        dogController.resizeDogImages,
        dogController.updateDog)
    .delete(
        authController.protect,
        authController.restrictTo('admin', 'lead-guide'),
        dogController.deleteDog
      )



          
module.exports = router;