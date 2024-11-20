const jwt=require('jsonwebtoken')
const secret="OMTRADER$"

function setUser(user) {
    return jwt.sign({_id:user.id,email:user.email,role:user.role},secret)
}

function getUser(token) {   
    if(!token) return null
    try {
        const decoded = jwt.verify(token, secret);
        return decoded; 
    } catch (error) {
        console.error("JWT verification error:", error.message);
        return null; 
    }
}

module.exports={setUser,getUser}