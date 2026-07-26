const  jsonwebtoken = require("jsonwebtoken");
const User = require("../models/User");

exports.authMiddleware = async(req,res,next) =>{
    try{
        const token = req.headers.authorization.split(' ')[1];;
        if(!token){
            return res.status(401).json('Token not found');
        }
        const decoded = jsonwebtoken.verify(token,process.env.JWT_SECRET);
        
         const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json('User not found');
        }
        if (user.isBlocked) {
            return res.status(403).json('Your account has been blocked. Contact admin.');
        }
        req.user = decoded;
        next();
    }catch(err){
        res.status(401).json('invalid token');
    }
}