import jwt from "jsonwebtoken"
import asyncHandler from "express-async-handler"
import User from "../schemas/userModel.js"

const protect = asyncHandler(async (req, res, next) => {
    
    let token = req.cookies.userJwt;
    // console.log(token);

    if (token) {
        try {
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decode.userId).select('-password')
            next()
        } catch (error) {
            res.status(401);
            throw new Error("Not auhtorized, invalid token")
        }
    } else {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
})

export default protect