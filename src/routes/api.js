const express = require("express");
const usermodule = require("../controllers/users")
const messagemodule = require("../controllers/messages")
const {signup, readUser} = require("../controllers/users");
const {printSession} = require("../middlewares/index.js");
const middleware = require("../middlewares/index.js") 
const auth = require("../auth/auth.js")
// On crée le router de l'api
const apiRouter = express.Router();
const mockupModule = require("../mockup/mockup.js")

/**
 * Route ping
 */
apiRouter.get('/ping', printSession, function (req, res) {
    res.json({
        status: "OK",
        timestamp: (new Date()).getTime()
    });
});

/**
 * Créer un utilisateur
 */
apiRouter.post('/user', async (req, res) => {

    // On crée l'utilisateur
    const utilisateurCree = await signup(req.body);

    // Pour tester la session on peut dire que le dernier utilisateur créé ira dans la session
    req.session.dernierUtilisateur = utilisateurCree;

    // On renvoie l'utilisateur créé !
    res.json(utilisateurCree);
});

/**
 * Renvoie ce qui se trouve dans la session
 */
apiRouter.get('/session', (req, res) => {
    res.json(req.session);
});

/**
 * Détruis la session
 */
apiRouter.delete('/session', (req, res) => {

    // S'il n'y a pas de session, on renvoie un message
    if (req.session === undefined) {
        res.json("Il n'y a pas de session à détuire")
    }

    // Si elle est existe alors on peut la détruire
    else {
        req.session.destroy()
        res.json("La session a été détruite !");
    }
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
    return res.send(req.session.user)
});

apiRouter.post('/signup', middleware.printSession, async (req,res) => {

    console.log("session for request: " + JSON.stringify(req.session))
    console.log("sign up = " + JSON.stringify(req.body))

    const newUID = await usermodule.signup(req.body)

    var response = {}
    response["success"] = true 
    response["uid"] = newUID
    response["session"] = req.session

    console.log("user was created, returning: " + JSON.stringify(response))

    res.json(response);

});

apiRouter.post('/signin',  async(req,res ) => {    

    console.log("body = " + JSON.stringify(req.body))
    
    console.log("app session = " + JSON.stringify(req.session))

    let email = req.body.email 
    let password = req.body.password
    const result = await usermodule.signin(email, password)
    req.session.jwt = result.jwt

    console.log("result signin : " + JSON.stringify(result))
    res.json(result)
});

apiRouter.post('/chatting', (req,res) => {

    // UID ? 

    console.log("YOOOOO !")
    console.log("sending message... = " + JSON.stringify(req.body))

    var response = {"success": true, "uid": req.body.uid, "content": req.body.messageContent}

    console.log("sending back = " + JSON.stringify(response)) 
    res.json(response)

});

apiRouter.get('/chatting', async (req,res) => {

    var headers = req.headers
    var jwt = headers.auth
    req.session.jwt = jwt ?? "unknow"
    console.log("session = " + JSON.stringify(req.session))

    res.redirect("/test")

   // res.json({"coucou": "hello"})

});

apiRouter.post('/message', async (req,res) => {
    cur_sess = req.session;

    // Create the message
    const createdMsg = await createMessage({userId: cur_sess.userId, content: req.body})
    res.json(createdMsg)
})

apiRouter.get('/messages', async (req,res)=> {
    var allMessages = await readAllMessages();
    var m = "";
    for (i in allMessages){
        m =+ allMessages[i].ownerID + " <a href='http://localhost:3000/message?id=" + allMessages[i].id + "'>" + allMessages[i].content + "</a></br>";
    }
    res.json(m)
})

apiRouter.get('/message/:messageId', async (req,res) => {
    res.json(await readMessage(req.params.messageId));
})


// On exporte seulement le router
module.exports = apiRouter;


