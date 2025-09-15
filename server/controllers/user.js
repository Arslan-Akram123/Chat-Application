const userSchema = require('../models/user');
const sendEmail = require('../services/sendEmail');
const validate=require('deep-email-validator')
const {generateToken} = require('../services/jwt');

async function registerUser(req, res) {
    console.log('Registration attempt:');
    const {username, email, password} = req.body;
   try{
      console.log('Received data:', {username, email, password});

        if(username.trim()=="" || email.trim()=="" || password.trim()==""){
            return res.status(400).json({type:"error",message:"All fields are required"});
        }

        // Username validation
        const usernameRegex = /^(?=.{3,50}$)(?!.*\s{2})([a-zA-Z][a-zA-Z0-9 ._-]*)$/;

        if (!usernameRegex.test(username)) {
        return res.status(400).json({
            type: "error",
            message:
            "Username must start with a letter, be 3–50 chars long, not contain consecutive spaces, and only use letters, numbers, spaces, ., _, -",
        });
        }
        // Email validation
         const finduser=await userSchema.findOne({email});
         if(finduser){
            return res.status(400).json({type:"error",message:"User already exists"});
         }
        const {valid, reason} = await validate.validate(email,{
            validateSMTP: true,
        });
        if (!valid) {
        return res.status(400).json({
            type: "error",
            message: `Email is invalid: ${reason}`,
        });
        }
        // Password validation
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[^\s]{7,15}$/;

        if (!passwordRegex.test(password)) {
        return res.status(400).json({
            type: "error",
            message:
            "Password must be 7–15 characters long, include at least one uppercase letter, one lowercase letter, one number, one special character (@$!%*?&), and must not contain spaces.",
        });
        }
        const newUser = new userSchema({username, email, password});
        await newUser.save();
        // Send activation email sendEmail(to,subject,text,html)
        sendEmail(newUser.email,"Account Activation","Please activate your account",`<a href="${process.env.CLIENT_URL}/auth/activate/${newUser._id}">Click here to activate your account</a>`);

        return res.status(201).json({type:"success",message:"User registered successfully now activate your account"});
   }catch(err){
    return res.status(500).json({type:"error",message:err.message||'Internal server error'});
   }
}

async function ActivateAccount(req, res) {
    const {userId}=req.params;
    try{
        const user=await userSchema.findById(userId);
        if(!user){
            return res.status(400).json({type:"error",message:"Invalid activation link"});
        }
        if(user.isActive){
            return res.status(400).json({type:"error",message:"Account already activated"});
        }
        user.isActive=true;
        await user.save();
        return res.status(200).json({type:"success",message:"Account activated successfully"});
    }catch(err){
        return res.status(500).json({type:"error",message:err.message||'Internal server error'});
    }
}

async function loginUser(req, res) {
    console.log('Login attempt:', req.body);
    const {email, password} = req.body;
    try{
        if(email.trim()=="" || password.trim()==""){
            return res.status(400).json({type:"error",message:"All fields are required"});
        }

        const user=await userSchema.findOne({email});
        if(!user){
            return res.status(400).json({type:"error",message:"Invalid email"});
        }

        const isMatch=await user.comparePassword(password);
        if(!isMatch){
            return res.status(400).json({type:"error",message:"Invalid password"});
        }

        if(!user.isActive){
            return res.status(400).json({type:"error",message:"Account not activated"});
        }
        user.isOnline=true;
        await user.save();
        // Generate JWT token
        const token=generateToken(user);
        res.cookie('token',token,{ 
            httpOnly:true,
            secure:true,
            sameSite:'strict',
        });
        return res.status(200).json({type:"success",message:"Login successful",token});
    }catch(err){
        return res.status(500).json({type:"error",message:err.message||'Internal server error'});
    }
}
async function logoutUser(req, res) {
    console.log('Logout attempt:');
    try{
        // const userId=req.user._id;
        const userId='68c8017fd81d32968a03a68c'
        const user=await userSchema.findById(userId);
        if(user){
            user.isOnline=false;
            user.lastSeen=new Date();
            await user.save();
        }
        res.clearCookie('token');
        return res.status(200).json({type:"success",message:"Logout successful"});
    }catch(err){
        return res.status(500).json({type:"error",message:err.message||'Internal server error'});
    }
}
function generatePassword() {
  const upperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowerCase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const specialChars = "@$!";
  const allChars = upperCase + lowerCase + numbers + specialChars;

  // Ensure at least one of each required type
  let password = "";
  password += upperCase[Math.floor(Math.random() * upperCase.length)];
  password += lowerCase[Math.floor(Math.random() * lowerCase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += specialChars[Math.floor(Math.random() * specialChars.length)];

  // Random total length between 8 and 15
  const passwordLength = Math.floor(Math.random() * (15 - 8 + 1)) + 8;

  // Fill the rest with random chars
  for (let i = password.length; i < passwordLength; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the password to avoid predictable pattern
  password = password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");

  return password;
}

let randompassword=''

async function resetPassword(req, res) {
    const {email}=req.body;
    try{
        if(email.trim()==""){
            return res.status(400).json({type:"error",message:"Email is required"});
        }
        const user=await userSchema.findOne({email});
        if(!user){
            return res.status(400).json({type:"error",message:"User not found"});
        }
        const newPassword=generatePassword();
        randompassword=newPassword;
        sendEmail(user.email,"Password Reset",`Your new password is: ${newPassword}`,`<a href="${process.env.CLIENT_URL}/auth/confirm-reset-password/${user._id}">Click here</a> <span>to reset your password</span> <br/> <p>Your new password is: ${newPassword}</p>
        `);
        return res.status(200).json({type:"success",message:"Password reset email sent"});
    }catch(err){
        return res.status(500).json({type:"error",message:err.message||'Internal server error'});
    }
}


async function confirmResetPassword(req, res) {
    const {id}=req.params;
    try{
        const user=await userSchema.findById(id);
        if(!user){
            return res.status(400).json({type:"error",message:"User not found"});
        }
        user.password=randompassword;
        await user.save();
        return res.status(200).json({type:"success",message:"Password reset successful"});
    }catch(err){
        return res.status(500).json({type:"error",message:err.message||'Internal server error'});
    }
}
module.exports = {
    registerUser,
    ActivateAccount,
    loginUser,
    resetPassword,
    confirmResetPassword,
    logoutUser
};