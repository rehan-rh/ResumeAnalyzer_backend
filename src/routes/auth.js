const express = require("express");
const { validateSignUpData } = require("../utils/validation");
const authRouter = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");
const jwt = require('jsonwebtoken');


authRouter.post("/signup", async (req, res) => {
    try {
     
      validateSignUpData(req);
  
      const { firstName, lastName, emailId, password } = req.body;
      console.log("Parsed user data:", firstName, lastName, emailId, password);
  
      const passwordHash = await bcrypt.hash(password, 10);
  
      const user = new User({
        firstName,
        lastName,
        emailId,
        password: passwordHash,
      });
  
      const savedUser = await user.save();
      res.status(201).json({ message: "User added successfully", data: savedUser });
    } catch (err) {
      console.error("Error:", err.message);
      res.status(400).send("Error: " + err.message);
    }
  });

  authRouter.post("/login",async(req, res)=>{
    try{
        const {emailId, password} = req.body;


        const user = await User.findOne({emailId});

        if(!user){
            throw new Error("Invalid credentials");
        }
        const isPasswordMatched = await bcrypt.compare(password, user.password);
        if(!isPasswordMatched){
            throw new Error("Invalid credentials");
        }
        const token = await jwt.sign({ _id: user._id }, "RESUME@123", {
            expiresIn: "1d",
          });

        res.cookie("token", token,{
            expires: new Date(Date.now() + 8 * 3600000),
        })

        res.status(200).json({ token, user });

    }catch(err){
        res.status(400).send("Error: "+err.message);
    }
  })
  
  authRouter.get("/logout", async (req, res) => {
    res.cookie("token", null,{
        expires: new Date(Date.now()),
    })
  })

module.exports = authRouter;