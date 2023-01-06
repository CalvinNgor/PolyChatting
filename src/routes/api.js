const express = require("express");
const usermodule = require("../controllers/users")
const messagemodule = require("../controllers/messages")
const {signup, readUser} = require("../controllers/users");

// On crée le router de l'api
const apiRouter = express.Router();

/**
 * Route ping
 */
apiRouter.get('/ping', function (req, res) {
    res.json({
        status: "OK",
        timestamp: (new Date()).getTime()
    });
});

/**
 * Créer un utilisateur
 */
apiRouter.post('/user', async (req, res) => {

    //Create the user
    const createdUser = await signup(req.body);

    res.json(createdUser)
});

/**
 * Récupère un utilisateur par rapport à son id
 */
apiRouter.get('/user/:userId', async (req, res) => {
    res.json(await readUser(req.params.userId));
});

/**
 * Modifie un utilisateur par rapport à son id et le contenu de la requête
 */
apiRouter.put('/user/:userId', async (req, res) => {
    res.json(await updateUser(req.params.userId, req.body));
});

/**
 * Supprime un utilisateur par rapport à son id
 */
apiRouter.delete('/user/:userId', async (req, res) => {
    res.json(await deleteUser(req.params.userId));
});

/**
 * Récupère tous les utilisateurs
 */
apiRouter.get('/users', async (req, res) => {
    res.json(await readAllUsers());
});





apiRouter.post('/signup', async (req,res) => {

    console.log("sign up = " + JSON.stringify(req.body))
    const result = await usermodule.signup(req.body)
    console.log("result signup : " + JSON.stringify(result))
    res.json(result);

});

apiRouter.post('/signin', async(req,res ) => {

    console.log("body = " + JSON.stringify(req.body))

    let email = req.body.email 
    let password = req.body.password

    const result = await usermodule.signin(email, password)
    console.log("result signin : " + JSON.stringify(result))
    res.json(result)
});

apiRouter.post('/chatting', async (req,res) => {

    console.log("message = " + JSON.stringify(req.body))
    const result = await messagemodule.sendMessage(req.body)
    console.log("result message : " + JSON.stringify(result))
    res.json(result);

});


// On exporte seulement le router
module.exports = apiRouter;


