const User=require('../models/user')
const {setUser}=require('../services/auth')
const argon2 = require('argon2');
const crypto = require('crypto');
const { sendWelcomeEmail, sendPasswordResetEmail,sendPasswordResetNotificationEmail } = require('../utils/emailService');
const {hashPassword} = require('../utils/password')
const {validatePassword, comparePasswords} = require('../utils/passwordValidation')

async function verifyPassword(plaintextPassword, hashedPassword) {
    try {
        const isMatch = await argon2.verify(hashedPassword, plaintextPassword);
        if (isMatch) {
            console.log('Password matches!');
        } else {
            console.log('Password does not match.');
        }
        return isMatch;
    } catch (err) {
        console.error('Error verifying password:', err);
        throw err;
    }
}

async function handleUserSignup(req,res) {
    const {name, email, password, confirmPassword}=req.body
    
    // Validate required fields
    if (!name || !email || !password || !confirmPassword) {
        return res.status(400).json({ error: "All fields are required" });
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
        return res.status(400).json({ 
            error: "Password validation failed", 
            details: passwordValidation.errors 
        });
    }

    // Check if passwords match
    if (!comparePasswords(password, confirmPassword)) {
        return res.status(400).json({ error: "Passwords do not match" });
    }
    
    try {
        const pwd = await hashPassword(password)
        const user = await User.create({
            name:name,
            email:email,
            password:pwd,
        })
        await sendWelcomeEmail(email, name)
        return res.redirect('/')
    } catch (error) {
        console.error('Signup error:', error);
        return res.status(500).json({ error: "Error during signup" });
    }
}

async function handleUserLogin(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.render('login', { err: "Email and password are required" });
    }

    try {
        // Find the user by email
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.render('login', { err: "Invalid username or password" });
        }

        // Verify the password
        const isMatch = await verifyPassword(password, user.password);  // Compare with the stored hashed password

        // If the password doesn't match
        if (!isMatch) {
            return res.render('login', { err: "Invalid username or password" });
        }

        //ask for delivery address  COMMENTED TO CONTINUE APP FLOW
        // if (user.delivery_address==="OM"){
        //     return res.render('address');
        // }

        // Password matches, generate a token and send it in a cookie
        const token = setUser(user);  
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Only use HTTPS in production
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });  
        return res.redirect('/');
    } catch (error) {
        console.error('Login error:', error);
        return res.render('login', { err: "An error occurred during login" });
    }
}

async function handleForgotPassword(req, res) {
    const { email } = req.body;
    
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.render('forgot-password', { error: 'Email not found' });
        }

        // Generate reset token and its hash
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        
        // Set token and expiration
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour from now
        await user.save();

        // Send password reset email with unhashed token
        await sendPasswordResetEmail(user.email, resetToken);
        
        console.log('Reset token generated:', resetToken); // For debugging
        console.log('Hashed token stored:', hashedToken); // For debugging
        
        res.render('forgot-password', { message: 'Reset link sent to your email' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.render('forgot-password', { error: 'Error processing request' });
    }
}

async function handleResetPassword(req, res) {
    const { token } = req.params;
    const { password } = req.body;

    try {
        // Validate password
        if (!password || password.length < 8) {
            return res.render('reset-password', { error: 'Password must be at least 8 characters long' });
        }

        // Hash the provided token to match stored hash
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        // Find user by token and ensure token hasn't expired
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.render('reset-password', { error: 'Invalid or expired reset token' });
        }

        // Update password using argon2
        user.password = await hashPassword(password);

        // Clear reset token fields
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        await sendPasswordResetNotificationEmail(user.email);

        // Redirect to login
        res.redirect('/login?reset=success');
    } catch (error) {
        console.error('Reset password error:', error);
        res.render('reset-password', { error: 'Error resetting password' });
    }
}

async function handleUserLogout(req, res) {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
    return res.redirect('/login');
}

module.exports={handleUserSignup,handleUserLogin,handleForgotPassword,handleResetPassword,handleUserLogout}