const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * Ce schema sera utilisé pour stocker les utilisateurs
 * @schema : User
 */
const UserSchema = new Schema({

    pseudo: {
        type: Schema.Types.String,
        required: true
    },

    email: {
        type: Schema.Types.String,
        required: true
    },


    psw: {
        type: Schema.Types.String,
        required: true
    },
    createdAt: {
        type: Schema.Types.Date,
        default: Date.now
    }
});


/** This schema is used to store messages
 * @Schema : Message
 */
const MessageSchema = new Schema({

    content: {
        type: Schema.Types.String,
        required: true
    },

    reaction: {
        type: Schema.Types.String,
        required: false
    },

    createdDate: {
        type: Schema.Types.Date,
        default: Date.now
    },
    modifiedDate: {
        type: Schema.Types.Date,
        default: Date.now
    },
    ownerID: {
        type: Schema.Types.String,
        required: true
    }

});



// On exporte le model
module.exports = {

    // On dit que le Model User est créé à partir du Schema UserSchema et le Model sera stocké dans la base de donnée MongoDB sous le nom "user"
    User: mongoose.model('user', UserSchema),
    Message: mongoose.model('message', MessageSchema)
}