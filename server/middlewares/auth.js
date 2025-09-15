const {verifyToken} = require('../services/jwt');
 

const auth = async (req, res, next) => {
    // console.log("req.headers",req.headers);
    const cookieHeader = req.headers['cookie'];
    let token;
    if (cookieHeader) {
        const match = cookieHeader.match(/token=([^;]+)/);
        token = match ? match[1] : null;
    }
    if (!token) return res.status(401).send('Unauthorized: Token not found');
    const result = verifyToken(token);
    if (result) {
        req.user = result;
        // console.log('Authenticated user:', req.user);
        return next();
    }
    return res.status(401).send('Unauthorized: Invalid token');
};

module.exports = auth;