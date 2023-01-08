const usersModule = require("../controllers/users")
const messageModule = require("../controllers/messages")
const { Message } = require("../models")

var email = "user@test.fr"
var password = "password"
var pseudo = "user"

module.exports.signUpUser = signUpUser
module.exports.signInUser = signInUser
module.exports.sendMessage = sendMessage
async function signUpUser() {

    try {

        var userData = {"email": email, "psw": password, "pseudo": pseudo}
        let uid = await usersModule.signup(userData)
        return uid 
    }
    catch(e) {
        throw e
    }

}

async function signInUser() {

    try {

        let some = await usersModule.signin(email, password)
        console.log("signed in = " + some.uid)
        return some 

    }
    catch(e) { throw e}

}

async function sendMessage(uid) {
    
    try {

        var message = new Message()
        message.ownerID = uid
        message.content = "This is a message"

        let some = await messageModule.sendMessage(message)
        return some
    }
    catch(e) {
        throw e
    }

}