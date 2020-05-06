"use strict";

require('dotenv').config();

const log = require('./utils/logger');
const serverPort = 9999,
        express = require("express"),
        app = express();
const data = require('./utils/DataAccess');

//  Healthcheck
app.get('/', function(req, res){
    res.send('ok');
});

//  Profile
//  * Input: modules/PlayerProfile
app.get('/profiles/:id', function (req, res) {
    log('get /profiles/:id');
    var user = data.ReadPlayerProfile(req.params.id);
    res.send({status:'ok', data:user});
});
app.patch('/profiles/:id', function(req,res){
    log('post /profiles/:id');
    data.UpdatePlayerProfile(req.body);
    res.send({status:'ok', data:req.body});
});
app.post('/profiles/:id', function(req,res){
    log('post /profiles/:id');
    data.UpdatePlayerProfile(req.body);
    res.send({status:'ok', data:req.body});
});

//  Game Server
//  * Input: Any
app.get('/gameservers/:id', function (req, res) {
    log('get /gameserver/:id');
    var game = data.GetGameServerStastics(req.params.id);
    res.send({status:'ok', data:game});
});
app.get('/gameservers', function (req, res) {
    log('get /gameserver');
    var games = data.GetGameServerStastics();
    res.send({status:'ok', data:games});
});
app.patch('/gameservers/:id', function(req,res){
    log('post /gameserver/:id');
    data.UpdateGameServerStastics(req.body);

    res.send({status:'ok'});
});
app.post('/gameservers/:id', function(req,res){
    log('post /gameserver/:id');
    data.UpdateGameServerStastics(req.body);

    res.send({status:'ok'});
});

//  Player
//  * Input: models/user
app.get('/players/:id', async function (req, res) {
    log('get /players/:id');
    var player = await data.EnsurePlayer(req.params.id);

    res.send({status:'ok', data:player});
});

app.patch('/players/:id', async function(req,res){
    log('post /players');
    await data.UpdatePlayer(req.body);

    res.send({status:'ok'});
});
app.post('/players/:id', async function(req,res){
    log('post /players');
    await data.UpdatePlayer(req.body);

    res.send({status:'ok'});
});

//  Match
//  * Input: models/MatchRecord
app.patch('/matches', async function(req,res){
    log('post /players');
    await data.NewMatch(req.body);

    res.send({status:'ok'});
});
app.post('/matches', async function(req,res){
    log('post /players');
    await data.NewMatch(req.body);

    res.send({status:'ok'});
});

app.get('/matches/:id', async function(req,res){
    log('post /players');
    var result = await data.readMatch(req.body);

    res.send({status:'ok',data:result});
});




app.listen(serverPort, function () {
    log(`Example app listening on port ${serverPort}`);
});