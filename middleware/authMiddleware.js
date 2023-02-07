const jwt = require("jsonwebtoken")

const requireAuth = (req, res, next) => {

    const token = req.cookies.jwt

    if (token){
        jwt.verify(token, "n0!Ds[Lfs*2Bs!TsSd", (err, decodedToken) => {
            if (err) {
                res.redirect("/")
            }
            else {
                console.log(decodedToken);
                next();
            }
        })
    }
    else {
        res.redirect("/")
    }
}

const checkUser = (req, res, next) => {

    if (token){
        jwt.verify(token, "n0!Ds[Lfs*2Bs!TsSd", (err, decodedToken) => {
            if (err) {
                console.log(err.message);
                next();
            }
            else {
                console.log(decodedToken);
                next();
            }
        })
    }
    else {
        res.redirect("/")
    }
}

module.exports = { requireAuth };