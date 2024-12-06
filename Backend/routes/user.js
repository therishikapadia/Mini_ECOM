const express=require('express')
const router=express.Router()
const {handleUserSignup,handleUserLogin,handleForgotPassword,handleResetPassword,handleUserLogout}=require('../controllers/user')

router.post('/signup',handleUserSignup)
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