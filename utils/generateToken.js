import jwt from "jsonwebtoken"

const generateToken = (res, userId, tokenName) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '1d'
    });
    res.cookie(tokenName, token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 24 * 60 * 60 * 1000
    })
}

export default generateToken;