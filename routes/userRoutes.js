const express = require('express')
const userController = require('./../controllers/userController')
const authrController = require('./../controllers/authController')

const router = express.Router();

router.post('/signup', authrController.signup)
router.post('/login', authrController.login)

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