// On importe les packages
const express = require("express");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const http = require("http");
const mongoose = require("mongoose");

// On importe les fichiers avec les routes
const apiRouter = require("./routes/api.js");

/* ========== PARTIE SERVEUR ========== */

// On crée l'application express
const app = express()


// On configure le server
app.use(logger('dev'));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended: false}));


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
});

/* ========== DECLARATION DES ROUTES ========== */

// On déclare que la route de base '/api' sera utilisé comme base pour les routes du fichier routes/api.js
app.use('/api', apiRouter);
