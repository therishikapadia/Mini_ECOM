const express = require('express');
const router = express.Router();
const { handleUserSignup, handleUserLogin, handleForgotPassword, handleResetPassword, handleUserLogout, confirmSignUp } = require('../controllers/user');

// Confirm sign-up
router.post('/confirm-signup', confirmSignUp);
router.get('/confirm-signup/:token', confirmSignUp);

router.post('/signup', handleUserSignup)
router.get('/signup', (req, res) => {
    res.render('signup', { error: null });
});
router.post('/login',handleUserLogin)
router.get('/logout',handleUserLogout)
router.post('/forgot-password', handleForgotPassword)
router.get('/forgot-password', handleForgotPassword)
router.post('/reset-password/:token', handleResetPassword)
router.get('/reset-password/:token', (req, res) => {
    const { token } = req.params;

    // Set the token in res.locals
    res.locals.token = token;

    // Render the reset password page
    res.render('reset-password', { error: null });
});


module.exports=router