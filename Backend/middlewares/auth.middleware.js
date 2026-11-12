const jwt = require('jsonwebtoken');
const tokenBlackListModel = require('../models/blacklist.model')


async function authUser ( req, res , next ) {    

    const authHeader = req.headers.authorization;
    const bearerToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    const token = req.cookies.token || bearerToken;

    if(!token) {
        return res.status(401).json({
            message: 'token not provided'
        })
    }

    const isTokenBlackListed = await tokenBlackListModel.findOne({
        token
    })

    if(isTokenBlackListed) {
        return res.status(401).json({
            message : 'invalid token'
        })
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        if (decoded.id && !decoded._id) {
            req.user._id = decoded.id;
        }
        next()
    }catch(err){
        return res.status(401).json({
            message: 'invalid token'
        })
    }
}


module.exports = { authUser } ;