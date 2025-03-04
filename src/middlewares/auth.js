const jwt = require("jsonwebtoken");
const User = require("../models/User");

const userAuth = async(req, res, next)=>{

    const {token} = req.cookies;

    if(!token){
        return res.status(401).send("Please login");
    }

    const decodedObj = await jwt.verify(token, "RESUME@123");

    const {_id} = decodedObj;

    const user = await User.findOne({_id});

    if(!user)
    {
        throw new Error("User not found");
    }

    req.user = user;
    next();
    

}
module.exports = {userAuth};