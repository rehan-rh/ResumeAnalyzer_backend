const express = require("express");
const { validateSignUpData } = require("../utils/validation");
const authRouter = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");
const jwt = require('jsonwebtoken');
const passport = require("passport");


authRouter.post("/signup", async (req, res) => {
    try {
     
      validateSignUpData(req);
  
      const { fullName, emailId, password } = req.body;
      console.log("Parsed user data:", fullName, emailId, password);
  
      const passwordHash = await bcrypt.hash(password, 10);
  
      const user = new User({
        fullName,
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

        res.send(user);

    }catch(err){
        res.status(400).send("Error: "+err.message);
    }
  })


  authRouter.post('/googlelogin', async (req, res) => {
    const { emailId } = req.body;
    console.log(req.body);

    try {
        // Find the user by email
        const user = await User.findOne({ emailId });
        if (!user) {
            console.log("Email not registered!");
            return res.status(401).json({ error: 'Email not registered' });
        }

        const token = await jwt.sign({ _id: user._id }, "RESUME@123", {
          expiresIn: "1d",
        });

      res.cookie("token", token,{
          expires: new Date(Date.now() + 8 * 3600000),
      })

      res.send(user);

        
    } catch (error) {
        console.error('Error during login:', error);
        console.log(error);
        res.status(500).json({ message: 'Server error.' });
    }
});

  
  authRouter.get("/logout", async (req, res) => {
    res.cookie("token", null,{
        expires: new Date(Date.now()),
    })
  })


module.exports = authRouter;