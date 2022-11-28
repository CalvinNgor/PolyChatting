const express = require("express");

// On crée le router des vues
const viewsRouter = express.Router();

// On veut que lorsque l'utilisateur aille sur http://localhost:3000 le serveur lui renvoie la vue hello.ejs dans le dossier views
viewsRouter.get('/', function (req, res) {
    res.render('hello');
});

// On exporte seulement le router
module.exports = viewsRouter;

