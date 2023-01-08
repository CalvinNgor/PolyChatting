const jwt = require('jsonwebtoken')
const secret = "U(wNUElYV(qBS}k6SJ%V.h;=?ZJ.XT"


module.exports.generateToken = generateToken

// Generate a token for the user that connect
function generateToken(uid) {
    let payload = {"date": Date(), "uid": uid }
    let token = jwt.sign(payload, secret,  { expiresIn: '1800s' })
    console.log("a token was generated for uid: " + uid + " value: " + token)
    return token
}


// This is a middleware
module.exports.validateToken = validateToken

// Verify the token of the user
function validateToken(req, res, next) {

    console.log("validating token = " + req.session.jwt)

    var token = req.session.jwt || "unknow"
    let verification = jwt.verify(token, secret)

    // ici vérifier que le jeton n'a pas expité ("exp")
    if (verification.hasOwnProperty("uid") && verification.uid != null) {
        console.log("adding uid = " + JSON.stringify(req.body))
        req.body.uid = verification.uid
        next()
    }

    res.status(403).send('Invalid token');
}