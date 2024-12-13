const User = require('../models/user');
const { setUser } = require('../services/auth')
const { sendWelcomeEmail, sendPasswordResetEmail, sendPasswordResetNotificationEmail } = require('../utils/emailService');
const argon2 = require('argon2');
const crypto = require('crypto');
const { hashPassword } = require('../utils/password');
const { validatePassword, comparePasswords } = require('../utils/passwordValidation');

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

async function handleUserSignup(req, res) {
    console.log("HI");
    const { name, email, password, confirmPassword,longitude,latitude } = req.body;
    console.log(name, email, password, confirmPassword);
    
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
        // Hash the password
        const hashedPassword = await hashPassword(password);

        // Generate a reset password token
        const confirmationToken = crypto.randomBytes(32).toString('hex');

        console.log('Generated token:', confirmationToken);

        // Store the user data temporarily (pending confirmation)
        const user = {
            name: name,
            email: email,
            password: hashedPassword,
            resetPasswordToken: confirmationToken, // Assign the token to the schema field
            isConfirmed: false, // Set confirmation status to false
            longitude,
            latitude
        };

        console.log('User created:', user);

        // Send the welcome email with the reset password token
        await sendWelcomeEmail(email, name, confirmationToken);

        return res.status(200).json({ success: true, data: { user } });
    } catch (error) {
        console.error('Signup error:', error);
        return res.status(500).json({ error: "Error during signup" });
    }
}


async function handleUserLogin(req, res) {
    const { email, password } = req.body;
    console.log(email, password);

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

        // Password matches, generate a token and send it in a cookie
        const token = setUser(user);
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Only use HTTPS in production
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });
        console.log(user);
        return res.status(200).json({ success: true, data: { user }, token: token });
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

// Confirm sign-up
async function confirmSignUp(req, res) {
  const { token } = req.params;

  console.log('Received token:', token);

  try {
    const user = await User.findOne({ resetPasswordToken: token });

    console.log('User found:', user);

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    user.isConfirmed = true;
    user.resetPasswordToken = null;
    await user.save();

    res.status(200).json({ message: 'Sign-up confirmed successfully' });
  } catch (error) {
    console.error('Error confirming sign-up:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Controller for logging out
async function handleUserLogout(req, res) {
    try {
        // Clear the authentication token cookie
        res.clearCookie('token', {
            httpOnly: true, // Prevent JavaScript access to the cookie
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
            sameSite: 'strict' // CSRF protection
        });

        // Respond with a success message
        return res.status(200).json({ success: true });
    } catch (error) {
        // Handle any errors that may occur during logout
        return res.status(500).json({ error: "Logout failed" });
    }
}

module.exports = { handleUserSignup, handleUserLogin, handleForgotPassword, handleResetPassword, handleUserLogout, confirmSignUp };
