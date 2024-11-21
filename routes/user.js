const express=require('express')
const router=express.Router()
const {handleUserSignup,handleUserLogin,handleForgotPassword,handleResetPassword,handleUserLogout}=require('../controllers/user')

router.post('/',handleUserSignup)
router.post('/login',handleUserLogin)
router.get('/logout',handleUserLogout)
router.post('/forgot-password', handleForgotPassword)
router.post('/reset-password/:token', handleResetPassword)
router.get('/forgot-password', (req, res) => res.render('forgot-password'))
router.get('/reset-password/:token', (req, res) => res.render('reset-password', { token: req.params.token }))

module.exports=router