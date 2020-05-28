const express = require("express");
const router=express.Router();
const auth = require("../middleware/auth");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {check,validationResult}=require('express-validator');
const config = require("config");

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey('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');

const User = require("../models/User")

router.get("/",auth,async (req,res) => {
    try{
        const user= await User.findById(req.user.id).select('-password');
        res.json(user);
    }catch(err){
        console.log(err.message);
        res.status(500).send("Server error");
    }
});

router.post("/signup",[
    check('name','Name is required')
    .not().isEmpty(),
    check('email',"Please include a valid email").isEmail(),
    check("password","Please enter a password for 6 or more characters").isLength({min : 6})
],async (req,res) => {
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    

const {name,email,password} = req.body;

try{

   var  user = await User.findOne({email:email});
    
    if(user){
        return res.status(400).json({errors:[{"msg":"A user with given email already exist"}]})
    }


    user= new User({
        name,
        email,
        password
    })

    const salt= await bcrypt.genSalt(10);

    user.password=await bcrypt.hash(password,salt);
    await user.save();

//Return jsonWebtoken
const payload={
    user:{
        id:user.id
    }
}

jwt.sign(
    payload,
    process.env.JWT,
    {expiresIn:360000},
    (err,token) => {
        if(err) throw err;
        res.json({token})
    }
)

}
catch(err){
console.log(err);
res.status(500).send('Server error')
}
}
);

router.post("/signin",[
    check('email',"Please include a valid email").isEmail(),
    check("password","Please enter a valid password").exists()
],async (req,res) => {
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    

const {email,password} = req.body;

try{

   var  user = await User.findOne({email:email});
    
    if(!user){
        return res.status(400).json({errors:[{"msg":"Invalid credentials"}]});
    }

    const isMatch = await bcrypt.compare(password,user.password);

    if(!isMatch){
        return res.status(400).json({errors:[{"msg":"Invalid credentials"}]});
    }

    

const payload={
    user:{
        id:user.id
    }
}

jwt.sign(
    payload,
    process.env.JWT,
    {expiresIn:360000},
    (err,token) => {
        if(err) throw err;
        res.json({token})
    }
)

}
catch(err){
console.log(err.message);
res.status(500).send('Server error')
}

}
)

router.post("/forgot",async (req,res) => {
    var user = await User.findOne({email:req.body.email});
    console.log(user);
    if(!user){
        return res.status(400).json({error:"Email not found"});
    }
    
    var OTP=Math.floor(1000 + Math.random() * 9000);
    user.otp = OTP;
    var user2=await user.save();
    console.log("user here",user2);
    const emailData = {
        to:user2.email,
        from:"fayequehannan10@gmail.com",
        subject:"OTP for password reset",
        html: `
        <h1>Hey user</h1>
        <h2>User name: ${user.name}</h2>
        <h2>OTP: ${OTP}</h2>`
    }
    sgMail
    .send(emailData)
    .then((sent) =>{
        console.log('SENT 2 >>>', sent);
        res.json("OTP send successfully");
    })
    .catch((err) => {
        console.log('ERR 2 >>>', err);
        res.json({error:err});
    })

    
})

router.post("/verify",async (req,res) => {
    const user = await User.findOne({email:req.body.email});
    if(user.otp == 0 || user.otp != parseInt(req.body.otp)){
        return res.status(400).json({error:"Wrong otp"});
    }
    const salt= await bcrypt.genSalt(10);

    user.password=await bcrypt.hash(req.body.password,salt);
    user.otp=0;
    await user.save();
    console.log(user);
    res.json({msg:"Password reset successfull"});
})

module.exports=router;
