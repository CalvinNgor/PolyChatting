const {getKeysNotProvided, isObjectIdStringValid} = require("../utils");

/**
 * Create a message
 * @param message The message to create
 * @returns The message created
 */

const {Message} = require("../models/index");
const { all } = require("../routes/api");

module.exports.getAllMessagesFormated = getAllMessagesFormated


// Collect messages in specific form
async function getAllMessagesFormated() {
    try {

        let allMessages = await Message.find({})

        let lastTen = allMessages.slice(20)

        return lastTen

    }
    catch(e) {
        throw e
    }
}

module.exports.readMessage = readMessage

// Read a message with his ID
async function readMessage(messageID) {

    // Verify that the message exists and the message's ID is valid
    if (messageID === undefined || !isObjectIdStringValid(messageID)){
        return "Le message n'existe pas ou n'existe pas dans MongoDB"
    }

    // We try to find the message
    try {

        console.log("reading message with id = " + messageID)

        // We want to find an object in the collection "Message" by his MongoDB's ID
        const messageFound = await Message.findById(messageID)
        
        return messageFound

    }

    catch (e) {
        throw e
    }
}

module.exports.sendMessage = sendMessage

// Send a message
async function sendMessage(messageData){

   //console.log("sending message = " + JSON.stringify(messageData))

    // TO DO : VALIDATE MESSAGE, JE T EFFACER LES TESTS

    try {
        // We create a message with MongoDB
        let messageToWrite = new Message(messageData)
        let some = await messageToWrite.save()
       // console.log("message has been written : " + JSON.stringify(some))
        return some
    }

    catch (e) {
        throw e
    }
}

module.exports.updateMessage = updateMessage

// Modify a message but is verifies conditions
async function updateMessage(messageID, ownerID, userID, messageToUpdate) {

    console.log("updating message = " + messageID + " - " + ownerID + " - " + userID + " - " + messageToUpdate)

    console.log("is owner id exist = " + (ownerID === undefined))
    console.log("is owner id exist = " + isObjectIdStringValid(ownerID))

    // Verify if messageID exist and if his MondoDB's ID is valid

    /*
    if (messageID === undefined || !isObjectIdStringValid(messageID)) {
        throw new Error("L'id du message n'existe pas ou n'est pas un id MongoDB")
    }

    // Verify if ownerID exist and if his MongoDB's ID is valid

    if (ownerID === undefined || !isObjectIdStringValid(ownerID)) {
        throw new Error("L'id de celui qui a envoyé n'existe pas ou n'est pas un id MongoDB")
    }

    // Verify if userID exist and if his MongoDB's ID is valid
    if (userID === undefined || !isObjectIdStringValid(userID)) {
        throw new Error("L'id de l'utilisateur n'existe pas ou n'est pas un id MongoDB")
    }*/


    // Verify if the content is not empty
    if (messageToUpdate.content === ""){
        throw new Error("could not update a blank message")
    }

    // We try to modify the message
    try {

        // We ask to MongoDB to modify keys/values in messageToUpdate
        const messageUpdated = await Message.findByIdAndUpdate(messageID, messageToUpdate, {new: true});

        // If the message found is null, so it doesn't exist in the data base
        if (messageUpdated === null || userID != ownerID) {
            return "Le message n'existe pas et n'a donc pas pû être modifié"
        }

        return messageUpdated

    }

    // Else it exists and we return it
    catch (e) {
        throw e
    }

}

// Verify if the user can delete a message with the message ID

async function canDeleteMessage(messageID, uid) {

    try {

        let message = await readMessage(messageID)
        if (message == null) {
            throw new Error("there is no message with this id")
        }

        if (uid == undefined || uid == null)  {
            throw new Error("there is no uid")
        }

        if (message.ownerID === uid) {
            return true 
        }

        return false 


    }
    catch(e) {
        throw e 
    }

}

module.exports.deleteMessage = deleteMessage

// Delete a message
async function deleteMessage(messageID, uid){

    // Verify if messageID exist and if his MondoDB's ID is valid
    if (messageID === undefined || !isObjectIdStringValid(messageID)) {
        throw new Error("invalid deleted message")
    }

    try{

        let canDelete = await canDeleteMessage(messageID, uid)

        if (canDelete == false) {
            throw new Error("this user " + uid + " cannot delete this message, he is not the owner")
        }

        // We ask MongoDB to delete the message that has a certain ID
        const messageToDelete = await Message.findByIdAndDelete(messageID);

        //If the founded message is null, so it doesn't exist
        if (messageToDelete === null) {
            throw new Error( "Le message n'existe pas et donc n'a pas pû être supprimé")
        }

        return messageToDelete;
    }
    catch (e) {
        throw e
    }
}
