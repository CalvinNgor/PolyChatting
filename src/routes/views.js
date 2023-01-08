const express = require("express");

// On crée le router des vues
const viewsRouter = express.Router();

// On veut que lorsque l'utilisateur aille sur http://localhost:3000 le serveur lui renvoie la vue hello.ejs dans le dossier views

viewsRouter.get('/', (req, res) => {
    res.render('hello');
});

// On veut que lorsque l'utilisateur aille sur http://localhost:3000/withdata le serveur lui renvoie la vue helloWithData.ejs dans le dossier views AVEC de la donnée
viewsRouter.get('/withdata', function (req, res) {

    // On rend la vue avec l'object {data: {var1: 1, var2: "World"}} comme donnée
    res.render('helloWithData', {data: {var1: 1, var2: "World"}});
});

// On veut que lorsque l'utilisateur aille sur http://localhost:3000/rest le serveur lui renvoie la vue testAPIREST.ejs.ejs dans le dossier views
viewsRouter.get('/rest', function (req, res) {
    res.render('testAPIREST.ejs');
});


viewsRouter.get('/signin', function (req, res) {
    res.render('signin.ejs');
});


viewsRouter.get('/polychatting', function (req, res) {
    res.render('polychatting.ejs');
});

viewsRouter.get('/signup', function (req, res) {
    res.render('signup.ejs');
});

// On veut que lorsque l'utilisateur aille sur http://localhost:3000/websocket le serveur lui renvoie la vue testWebsocket.ejs.ejs dans le dossier views
viewsRouter.get('/websocket', function (req, res) {
    res.render('testWebsocket.ejs');
});


viewsRouter.get('/chatting', function (req, res) {
    res.render('chat.ejs');
});

viewsRouter.get('/users', function (req,res){
    res.render('users.ejs')
})

viewsRouter.get('/test', function (req,res){
    res.render('test.ejs')
})

viewsRouter.get('/test2', function (req,res){
    res.render('test2.ejs')
})

viewsRouter.get('/test3', function (req,res){
    res.render('test3.ejs')
})


// On exporte seulement le router
module.exports = viewsRouter;