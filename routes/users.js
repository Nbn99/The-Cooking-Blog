const express = require('express');
const usersController = require('../controllers/users');
const { check, body } = require('express-validator');

const User = require('../models/users')

const router = express.Router();
router.get('/login', usersController.getLogin);

router.get('/signup', usersController.getSignup);

router.get('/reset-password', usersController.getReset);

router.get('/reset-password/:token', usersController.getNewPassword);

router.post(
    '/login',
    [
        body('email')
            .isEmail()
            .withMessage('Please enter a valid email address.')
            .normalizeEmail(),
        body('password', 'Password has to be valid.')
            .isLength({ min: 5 })
            .isAlphanumeric()
            .trim()
    ],
    usersController.postLogin
);

router.post(
    '/signup',
    [
        check('email')
          .isEmail()
          .withMessage('Please enter a valid email.')
          .custom((value, { req }) => {
            return User.findOne({ email: value }).then(userDoc => {
              if (userDoc) {
                return Promise.reject(
                  'E-Mail exists already, please pick a different one.'
                );
              }
            });
          })
          .normalizeEmail(),
        body(
          'password',
          'Please enter a password with only numbers and text and at least 5 characters.'
        )
          .isLength({ min: 5 })
          .isAlphanumeric()
          .trim(),
        body('confirmPassword')
          .trim()
          .custom((value, { req }) => {
            if (value !== req.body.password) {
              throw new Error('Passwords have to match!');
            }
            return true;
          })
      ],
    usersController.postSignup
);

router.post('/logout', usersController.postLogout);

router.post('/reset-password', usersController.postReset);

router.post('/new-password', usersController.postNewPassword);


module.exports = router;