import {auth} from 'express-oauth2-jwt-bearer'

const jwtCheck = auth({
    audience: "http://localhost:8000",
    issuerBaseURL: "dev-rcyesob4j4uh7807.us.auth0.com",
    tokenSigningAlg: "RS256"
})

export default jwtCheck