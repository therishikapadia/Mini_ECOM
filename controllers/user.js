const User=require('../models/user')
const {setUser}=require('../service/auth')
const argon2 = require('argon2');
const {} = require('../utils/password')

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
    const {name,email,password}=req.body
    
    // Validate required fields
    if (!name || !email || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }
    
    try {
        const pwd = await hashPassword(password)
        await User.create({
            name:name,
            email:email,
            password:pwd,
        })
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
        res.cookie('token', token);  
        return res.redirect('/');
    } catch (error) {
        console.error('Login error:', error);
        return res.render('login', { err: "An error occurred during login" });
    }
}

module.exports={handleUserSignup,handleUserLogin}
