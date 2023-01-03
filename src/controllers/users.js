/**
 * Créer un utilisateur
 * @param user L'utilisateur à créer
 * @returns L'utilisateur crée
 */
const {getKeysNotProvided} = require("../utils");
const {User} = require("../models/index")

const bcrypt = require('bcrypt');
const saltRounds = 10;

async function comparePasswordToHash(hash, password) {
    try {

        return new Promise((resolve, reject) => {
            bcrypt.compare(password, hash, function(err, result) {
                resolve(result == true)
            });
        })

    }
    catch(e) {
        throw e
    }
}

async function hashPassword(password) {
    try {

        return new Promise((resolve, reject) => {
            bcrypt.genSalt(saltRounds, function(err, salt) {

                console.log("salt = " + salt)
    
                bcrypt.hash(password, salt, function(err, hash) {
                    console.log("hash#1 = " + hash)
                    resolve(hash)
                });
            });
        })


    }
    catch(e) {
        throw e
    }
}

async function validPassword(password, hash) {
    try {
        let validation = await comparePasswordToHash(hash, password)
        return validation
    }
    catch(e) {
        throw e
    }
}

async function signup(user) {

    console.log("signup : " + JSON.stringify(user))

    // On regarde déjà si tous les champs de l'utilisateur sont présents
    const neededKeys = ["pseudo", "psw", "email"];
    const keysNotGiven = getKeysNotProvided(neededKeys, user);

    // Si une ou plusieurs clefs ne sont pas données alors on renvoie un message d'erreur
    if (keysNotGiven.length !== 0) {
        return `Les informations suivantes ne sont pas fournies ou vides: '${keysNotGiven.join(', ')}'`;
    }

    // On peut essayer de créer l'utilisateur
    try {

        // On crée un utilisateur avec le model de MongoDB et les informations de l'utilisateur
        const userToCreate = new User(user);
        const doesUserExist = await userExists(userToCreate.email)
        if (doesUserExist == true){
            return "L'utilisateur existe déjà, connectez-vous"
        }

        // password 
        console.log("user password to hash = " + user.psw)
        
        let nonHasPassword = JSON.parse(JSON.stringify(user.psw))
        console.log("nonHasPassword = " + nonHasPassword)

        let hash = await hashPassword(user.psw)

        userToCreate.psw = hash
        
        console.log("new password hash = " + hash)

        // Puis on le sauvegarde en n'oubliant pas le mot clef await qui va nous permettre d'attendre que l'utilisateur
        // soit sauvegarder pour nous le renvoyer
        let newUid = await pushUser(userToCreate)
        return "Bienvenue ! Votre id utilisateur : " + newUid
    }
        // S'il y a une erreur lors du processus alors on renvoie un message d'erreur
    catch (e) {
        console.error("erreur : " + e.message)
        return "Une erreur s'est produite lors de la création de l'utilisateur";
    }

}

async function signin(email, password) {

    try {

        // On vérifie l'utilisateur avec le model de MongoDB et les informations de l'utilisateur
        const doesUserExist = await userExists(email)
        if (doesUserExist == false){
            return "L'utilisateur n'existe pas, vous devez créer un compte"
        }

        let user = await findUserByEmail(email)

        if (user == null) { throw new Error("no user found in sign in")}

        console.log("#signin : user psw = " + user.psw)
        console.log("#signin : password = " + password)

        let isPasswordValid = await validPassword(password, user.psw)

        if (isPasswordValid == false) {
            throw new Error("invalid password !")
        }
        
        return "Bienvenue, vous êtes logguer"
    }
        // S'il y a une erreur lors du processus alors on renvoie un message d'erreur
    catch (e) {
        console.error("erreur sign in user : " + e.message)

        console.error(e)

        return "Une erreur s'est produite lors de la création de l'utilisateur";
    }


}




// verifier si ID deja existant
async function userExists(email){
    try {
        let user = await findUserByEmail(email)
        if (user == null) { return false }
        return true 
    }
    catch (e){
        throw e;
    }
}


function isUserValid(user) {

    // TO DO: ADD MORE TEST 

    // Valid a user 
    // Add any test you want the user to take
    if (user.email == undefined) {
        return false 
    }

    if (user.pseudo == undefined) {
        return false 
    }

    // If pseudo.length > 0 && pseudo.length < 90 
    // If pseudo is string ...
}

async function findUserById(uid) {
    try {

        if (!uid) { throw new Error("user id is invalid")}
        const userFound = await User.findOne(uid)
        return userFound

    }
    catch(e) {
        throw e
    }
}

/**
 * 
 * @param {String} userEmail 
 * @returns user || null 
 */
async function findUserByEmail(userEmail) {
    try {

        console.log("user email = " + userEmail)
        if (!userEmail) { throw new Error("user email is invalid")}
        const userFound = await User.findOne({ email: userEmail })
        return userFound

    }
    catch(e) {
        throw e
    }
}

/**
 * Write a user to database
 * @param {User} user 
 * @returns {String} uid
 */
async function pushUser(user){

    try {

        if (isUserValid(user) == false) {
            throw new Error("user is not valid, aborting")
        }

        let doesUserExist = await userExists(user.email)

        if (doesUserExist) {
            throw new Error("user already exist, aborting write operation.")
        }

        // Puis on le sauvegarde en n'oubliant pas le mot clef await qui va nous permettre d'attendre que l'utilisateur
        // soit sauvegarder pour nous le renvoyer
        let some = await user.save();
        return some.id

    }
    catch(e) {
        throw e
    }
}

// Trouver un utilisateur par son email
// Ecrire dans la base de donnee un nouvel user

/**
 * Lire un utilisateur par son id unique créé par MongoDB
 * @param userId L'identifiant de l'utilisateur à lire
 * @returns L'utilisateur trouvé
 */
async function readUser(userId) {

    // Vérifier si l'userId existe et est un id MongoBD valide
    if (userId === undefined || !isObjectIdStringValid(userId)) {
        return "L'id de l'utilisateur n'existe pas ou n'est pas un id MongoDB"
    }

    // On essaye de trouver l'utilisateur
    try {

        // On veut chercher un object dans la collection "User" par son identifiant MongoDB
        const userFound = await User.findById(userId);

        // Si l'utilisateur trouvé est null c'est qu'il n'existe pas dans la base de données
        if (userFound === null) {
            return "L'utilisateur n'existe pas"
        }

        // Sinon c'est qu'il existe et on le renvoie
        return userFound;
    }

        // S'il y a une erreur, on envoie un message à l'utilisateur
    catch (e) {
        return "Erreur lors de la recherche de l'utilisateur";
    }
}

/**
 * Mettre à jour un utilisateur
 * @param userId L'id de l'utilisateur à mettre à jour
 * @param userToUpdate Les éléments de l'utilisateur à mettre à jour
 * @returns L'utilisateur modifié
 */
async function updateUser(userId, userToUpdate) {

    // Vérifier si l'userId existe et est un id MongoBD valide
    if (userId === undefined || !isObjectIdStringValid(userId)) {
        return "L'id de l'utilisateur n'existe pas ou n'est pas un id MongoDB"
    }

    // Petite chose TRES importante, dans le doute où dans l'object userToUpdate se trouve une clef _id qui a été modifié par une personne malveillante
    // il faut la supprimer de l'object, car _id est un id généré automatiquement et il ne doit pas changer !

    // Attention vu qu'on ne peut pas faire confiance à l'utilisateur il faut vérifier si les champs qu'on veut modifier on bien de la donnée et qu'elle soit non vide,
    // sinon on pourrait remplacer de la donnée importante...
    if (userToUpdate.prenom === "") {
        delete userToUpdate.prenom;
    }

    if (userToUpdate.nom === "") {
        delete userToUpdate.nom;
    }

    if (userToUpdate.age === "") {
        delete userToUpdate.age;
    }

    // On essaye de modifier les informations de l'utilisateur
    try {

        // On demande à MongoDB de modifier les couples clefs/valeurs présents dans l'object userToUpdate de l'object qui a pour identifiant unique MongoDB 'userId'
        // Noter l'option {new: true} qui veut dire que MongoDB nous renverra l'object modifié et non l'object avant sa modification (car on veut renvoyer le user modifié à l'utilisateur)
        const userUpdated = await User.findByIdAndUpdate(userId, userToUpdate, {new: true});

        // Si l'utilisateur trouvé est null c'est qu'il n'existe pas dans la base de données
        if (userUpdated === null) {
            return "L'utilisateur n'existe pas et n'a donc pas pû être modifié"
        }

        // Sinon c'est qu'il existe et on le renvoie
        return userUpdated;
    }

        // S'il y a une erreur, on envoie un message à l'utilisateur
    catch (e) {
        return "Erreur lors de la modification de l'utilisateur";
    }
}

/**
 * Supprime un utilisateur
 * @param userId L'identifiant de l'utilisateur à supprimer
 * @returns L'utilisateur qui vient d'être supprimé
 */

async function deleteUser(userId) {

    // Vérifier si l'userId existe et est un id MongoBD valide
    if (userId === undefined || !isObjectIdStringValid(userId)) {
        return "L'id de l'utilisateur n'existe pas ou n'est pas un id MongoDB"
    }

    // On essaye de supprimer l'utilisateur
    try {

        // On demande à MongoDB de supprimer l'utilisateur qui a comme identifiant unique MongoDB 'userId'
        const userDeleted = await User.findByIdAndDelete(userId);

        // Si l'utilisateur trouvé est null c'est qu'il n'existe pas dans la base de données
        if (userDeleted === null) {
            return "L'utilisateur n'existe pas et n'a donc pas pû être supprimé"
        }

        // Sinon c'est qu'il existe et on le renvoie
        return userDeleted;
    }

        // S'il y a une erreur, on envoie un message à l'utilisateur
    catch (e) {
        return "Erreur lors de la suppression de l'utilisateur";
    }
}

/**
 * Récupère TOUS les utilisateurs depuis la base de données
 */
async function readAllUsers() {

    // On essaye de récupérer TOUS les utilisateurs (donc on ne met pas de conditions lors de la recherche, juste un object vide)
    try {
        return await User.find({})
    }

        // S'il y a une erreur, on renvoie un message
    catch (e) {
        return "Il y a eu une erreur lors de la recuperation des utilisateurs";
    }
}

// On exporte les modules
module.exports = {
    readUser: readUser,
    updateUser: updateUser,
    deleteUser: deleteUser,
    readAllUsers: readAllUsers,
    signup : signup,
    signin : signin, 
    pushUser: pushUser, 
    findUserByEmail: findUserByEmail, 
    findUserById: findUserById
}