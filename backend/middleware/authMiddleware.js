const  jsonwebtoken = require("jsonwebtoken");

exports.authMiddleware = (req,res,next) =>{
    try{
        const token = req.headers.authorization.split(' ')[1];;
        if(!token){
            return res.status(401).json('Token not found');
        }
        const decoded = jsonwebtoken.verify(token,process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }catch(err){
        res.status(401).json('invalid token');
    }
}