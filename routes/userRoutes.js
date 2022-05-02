const express = require('express')
const userController = require('./../controllers/userController')
const authController = require('./../controllers/authController')


const router = express.Router();

router.post('/signup', authController.signup)
router.post('/login', authController.login)

router.post('/forgotPassword', authController.forgotPassword)
router.patch('/resetPassword/:token', authController.resetPassword)

// all routes below this middleware have to login
router.use(authController.protect);

router.patch('/updateMyPassword', authController.protect, authController.updatePassword)

router.get('/me', userController.getMe, userController.getUser)
router.patch('/updateMe', userController.updateMe)
router.delete('/deleteMe', userController.deleteMe)

// all routes below this middleware have to be logged in as admin
router.use(authController.restrictTo('admin'))

router
    .route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser)
router
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser)



module.exports = router;