const jwt=require("jsonwebtoken");

const generateToken=(user)=>{
    const payload={
        id:user._id,
        name:user.username,
        email:user.email,
    }
    return jwt.sign(payload,process.env.JWT_SECRET);
}

const verifyToken=(token)=>{
    try{
        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        return decoded;
    }catch(err){
        console.error("Token verification error:",err);
        return null;
    }
}
module.exports={generateToken,verifyToken};