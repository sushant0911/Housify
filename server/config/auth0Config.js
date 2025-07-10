import { auth } from 'express-oauth2-jwt-bearer'

const jwtCheck = auth({
    audience: "https://housify-nine.vercel.app",
    issuerBaseURL: "https://dev-ls532ldoa0brzf46.us.auth0.com",
    tokenSigningAlg: "RS256"
})

export const optionalJwtCheck = (req, res, next) => {
    // Try to authenticate, but don't fail if token is invalid
    jwtCheck(req, res, (err) => {
        if (err) {
            console.log("JWT authentication failed, continuing without auth:", err.message);
            // Continue without authentication
            req.user = null;
            req.auth = { sub: null };
        }
        next();
    });
};

export default jwtCheck;