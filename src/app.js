// On importe les packages
const express = require("express");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const {Server} = require("socket.io");
const messageModule = require("./controllers/messages")


// On importe les fichiers avec les routes
const apiRouter = require("./routes/api.js");
const viewsRouter = require("./routes/views");
const {Message} = require("./models");

const session = require("express-session");
const redis = require("redis");
const connectRedis = require("connect-redis");



/* ========== PARTIE SERVEUR ========== */

// On crée l'application express
const app = express();

// Comme nous faisons du développement nous allons avoir des problèmes liés au CORS (https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
// Vu que l'on ne veut pas de soucis pour le développement, on va bypass cette mesure de sécurité !
app.use(cors({
    // En gros l'origin sera toujours celle qui faut pour ne plus avoir de soucis avec CORS
    origin: (requestOrigin, callback) => callback(undefined, requestOrigin),
    credentials: true
}))

// On configure le app
app.use(logger('dev'));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended: false}));

// Permet de dire à Express que le moteur de "vues" (le frontend) est EJS, c'est une amélioration du HTML où on peut utiliser des variables, des boucles et tout un tas de mécanismes: https://ejs.co/#docs
app.set('view engine', 'ejs');

// Crée un serveur HTTP
const server = http.createServer(app);

// On allume le serveur au port 3000
server.listen(3000);

// Quand le serveur est allumé on le log
server.on('listening', function () {
    console.log("Le serveur est allumé");
});

// Si il y a une erreur on la log
server.on('error', function (error) {
    console.error(error);
});

/* ========== PARTIE MONGODB ========== */

// Les options à donner à MongoDB
const options = {
    keepAlive: true,
    useUnifiedTopology: true,
    useNewUrlParser: true,
};

// L'host, c'est-à-dire l'adresse d'où se trouve la base MongoDB
// La notation a = b || c en JS veut dire, j'affecte à a la valeur de b si elle existe (non chaine de caractère vide, non null et non undefined), sinon je prends la valeur c
// Il faut lire ça: mongoDBHost est la variable d'environnement MONGO_HOST si elle est définie sinon c'est "localhost"
const mongoDBHost = process.env.MONGO_HOST || "localhost";

/*
Connexion à Mongodb avec les options définies auparavant
- mongodb : est le protocol que MongoDB utilise pour se connecter, comme http ou ssh par exemple (ne bouge jamais)
- mongoDBHost : est l'adresse locale d'où se trouve la base de données (localhost), et si la variable d'environnement MONGO_HOST existe et n'est pas vide alors on prendra cette valeur la => utilisé pour docker
- 27017 : est le port où MongoDB écoute (c'est le port par défaut)
- maBaseDeDonnee : est le nom de la base de données, il peut être ce que vous voulez
 */
mongoose.connect(`mongodb://${mongoDBHost}:27017/maBaseDeDonnee`, options, function (err) {
    if (err) {
        throw err;
    }
    console.log('Connexion à Mongodb réussie');
  // test()

});


/* ========== PARTIE REDIS ========== */

// On crée l'object qui nous permettra de gérer les sessions avec Redis
const RedisStore = connectRedis(session)

// L'host, c'est-à-dire l'adresse d'où se trouve la base Redis
// La notation a = b || c en JS veut dire, j'affecte à a la valeur de b si elle existe (non chaine de caractère vide, non null et non undefined), sinon je prends la valeur c
// Il faut lire ça: mongoDBHost est la variable d'environnement REDIS_HOST si elle est définie sinon c'est "localhost"
const redisHost = process.env.REDIS_HOST || "localhost";

// On configure le client Redis
const redisClient = redis.createClient({

    // L'adresse où se trouve la base de données Redis
    host: redisHost,

    // Le port de la base de données
    port: 6379
})

// S'il y a une erreur on veut dire laquelle
redisClient.on('error', (err) => {
    console.error("Impossible d'établir une connexion avec redis. " + err);
});

// Si la connection est un succès, on veut le dire
redisClient.on('connect', () => {
    console.log("Connexion à redis avec succès");
});

// On configure le middleware de session, ce qui servira pour ajouter un object session qui sera disponible à chaque requête
app.use(session({

    // On utilise redis pour stocker les sessions utilisateur
    store: new RedisStore({client: redisClient}),

    // C'est ce qui permet d'encoder et décoder les sessions pour des raisons de sécurité évidentes (il doit être méconnu de tous pour ne pas se faire pirater)
    secret: "JeSuisSecret!",

    // Le domain (le début de l'URL) sur lequel la session doit être active, si votre site est https://test.com
    // le domaine sera "test.com" mais comme on fait du devloppement en local, ici il le domain est "localhost"
    domain: "localhost",

    // Quelques autres options
    resave: false,
    saveUninitialized: false,
    proxy: true,

    // Le cookie qui servira à stocker la session
    cookie: {

        // Si vrai, ne transmettre le cookie que par https.
        // On est en développement donc juste en http, on doit donc mettre false
        secure: false,

        // Si vrai, empêche le JS côté client de lire le cookie
        // Comme on est en développement, on peut le mettre à false, mais en production il doit être à true
        httpOnly: false,

        // La durée de vie de la session en millisecondes, après ce délai la session sera détruite, il faudra par exemple se reconnecter pour se recréer une session
        maxAge: 86400000, // 86400000ms = 1 jour

        // On laisse le même domaine que dans les options plus haut
        domain: "localhost"
    },
}));



/* ========== PARTIE SOCKET IO ========== */

// Crée le socket io qui sera utilisé pour la websocket
const io = new Server(server, {

    // Comme nous faisons du développement nous allons avoir des problèmes liés au CORS (https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
    // Vu que l'on ne veut pas de soucis pour le développement, on va bypass cette mesure de sécurité !
    cors: {

        // En gros l'origin sera toujours celle qui faut pour ne plus avoir de soucis avec CORS
        origin: (requestOrigin, callback) => {
            callback(undefined, requestOrigin);
        },
        methods: ["GET", "POST"],
    },
});






// L'événement "connection" est réservé à quand un utilisateur se connecte à la websocket
io.on('connection', (socket) => {

    // On va donc logguer l'id qui s'est connecté !
    console.log("socket on connection : " + socket.id);

    // Il y a plusieurs façons de faire transiter de la donnée avec SocketIO...

    // Soit à une seule socket
    socket.emit("mon_evenement_que_pour_moi", "Salut !");

    // On va envoyer à cette socket que la connection a bien été établie pour la montrer sur le client
    socket.emit("est_connecte", `Vous êtes connecté à la Websocket qui a l'id: ${socket.id}`);

    // Soit à toutes les sockets
    io.emit("une_nouvelle_socket_s_est_connecte", `La socket '${socket.id}' vient de se connecter, bienvenue !`);

    // Il existe aussi d'autres principes comme les rooms (https://socket.io/docs/v3/rooms/) ou les namespaces (https://socket.io/docs/v3/namespaces/). Je vous conseille d'y jeter un coup d'œil !
    // ...


    
    // Ici on peut faire en sorte d'ajouter des événements à "écouter", si un événement est reçu alors la fonction est effectuée
    socket.on("mon_evenement", function (data) {

        // On renvoie à la socket d'où provient l'événement la donnée qu'elle nous a envoyé avec un événement et de la donnée
        socket.emit("mon_evenement_bien_recu", data);
    });

    socket.on("mon_evenement_pour_tout_le_monde", function (data) {

        // On à TOUTES les sockets ce que la socket nous a envoyé
        io.emit("mon_evenement_pour_tout_le_monde_bien_recu", {id: socket.id, date: data});
    });

    // Pour envoyer et recevoir le dernier message stocké dans Redis
    socket.on("envoyer_dernier_message", async (data) => {

        try {
            console.log("someone send a message : " + JSON.stringify(data))

            let dataMessage = {"content": data, "ownerID": "truc"}
    
            await messageModule.sendMessage(dataMessage)

            let stringAll = await messageModule.getAllMessagesFormated()
            
            console.log("### STREING ALL = " + stringAll)

            socket.emit("message_sent", stringAll)
    
            // On met à jour le dernier message dans Redis à la clef "DERNIER_MESSAGE"
            redisClient.set("DERNIER_MESSAGE", data)
        }
        catch(e) {
            console.error(e)
        }

    })
    socket.on("recevoir_dernier_message", function (data) {

        // On a demandé de renvoyer le dernier message de Redis et c'est ce qu'on fait où la clef de ce dernier message est "DERNIER_MESSAGE"
        redisClient.get("DERNIER_MESSAGE", function (erreur, leDernierMessage) {
            socket.emit("recevoir_dernier_message_reponse", leDernierMessage);
        })
    })

    // Il y a un autre mot clef pour la déconnexion d'une socket !
    socket.on("disconnect", function () {
        io.emit("une_socket_s_est_deconnecte", `La socket '${socket.id}' vient de se déconnecter, au revoir !`);
    })
});


function handleNewMessageFromSocket() {

}





/* ========== DECLARATION DES ROUTES ========== */

// On déclare que la route de base '/api' sera utilisé comme base pour les routes du fichier routes/api.js
app.use('/api', apiRouter);

// On déclare que la route de base '/' sera utilisé comme base pour les routes du fichier routes/views.js
app.use('/', viewsRouter);



// TEST 
async function test() {

    let userModule = require("./controllers/users");
    let messageModue = require("./controllers/messages")
    const { User } = require("./models/index.js");
    try {

        let someDic = {"content": "ceci est un message", "reaction": "😍", "ownerID": "truc"}
        //let sentMessage = await messageModue.sendMessage(someDic)

       // console.log("sent message id = " + sentMessage.id)

        /*
        let someMessageWritten = await messageModue.readMessage(sentMessage.id)

        console.log("message written = " + JSON.stringify(someMessageWritten))

        let dataChanged = {"content": "ceci est un message mais modifié"}

        await messageModue.updateMessage(someMessageWritten.id, someMessageWritten.ownerID,someMessageWritten.ownerID, dataChanged)

        let someMessageWritten2 = await messageModue.readMessage(sentMessage.id)

        console.log("message written but updated = " + JSON.stringify(someMessageWritten2))*/

        await messageModue.deleteMessage("63b3443a2b2706fdc1a84077", "truc")

        let someMessageWritten3 = await messageModue.readMessage("63b3443a2b2706fdc1a84077")

        console.log("message written but deleted = " + JSON.stringify(someMessageWritten3))


        

        /*
        let user = new User()
        user.email = "coucou@coucou.fr"
        user.pseudo = "coucou"
        user.psw = "password"
        let uid = await userModule.pushUser(user)
        console.log("uid = " + uid)

        let message = new Message()
        message.content = "test"
        message.reaction = "surpris"
        message.ownerID = "63b313fac2e325694fc62b42"


        let aUser = await userModule.findUserByEmail("caca@coucou.fr")
        console.log("aUser = " + JSON.stringify(aUser))
        */

        /*
        let aUserById = await userModule.findUserById(uid)
        console.log("aUser by id = " + JSON.stringify(aUserById))*/

        return 
    }
    catch(e) {
        console.error("error = " + e.message)
    }

}


