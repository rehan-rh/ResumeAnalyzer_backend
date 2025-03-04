const validator = require("validator");

const validateSignUpData = (req)=>{
    const {fullName, emailId, password} = req.body;
    if(!fullName || !password)
    {
        throw new Error("Fields should not be empty...!");
    }
    else if(!validator.isEmail(emailId)){
        throw new Error("Email is not valid...!");
    }
}

module.exports = {validateSignUpData};