"use strict";


const log = require('./utils/logger');
const serverPort = 9998
const DataAccess = require('./utils/DataAccess');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const data = new DataAccess();
require('dotenv').config();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

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
    data.NewPlayerProfile(req.body);
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
app.post('/gameservers/:id', function(req,res){
    log('post /gameserver/:id');
    data.UpdateGameServerStastics(req.body);

    res.send({status:'ok'});
});
app.patch('/gameservers/:id', function(req,res){
    log('post /gameserver/:id');
    data.UpdateGameServerStastics(req.body);

    res.send({status:'ok'});
});

//  Player
//  * Input: models/user
app.get('/players/:id', async function (req, res) {
    try{
        log('get /players/:id');
        var player = await data.EnsurePlayer(req.params.id);

        res.send({status:'ok', data:player});
    }catch(ex){
        console.log(`===========\r\n${ex}`);
        throw ex;
    }
});

app.post('/players/:id', async function(req,res){
    log('post /players');
    await data.UpdatePlayer(req.body);

    res.send({status:'ok'});
});
app.patch('/players/:id', async function(req,res){
    log('post /players');
    await data.UpdatePlayer(req.body);

    res.send({status:'ok'});
});

//  Match
//  * Input: models/MatchRecord
app.post('/matches', async function(req,res){
    log('patch /matches');
    console.log(req.body);
    var result = await data.NewMatch(req.body);

    res.send({status:'ok',data:result});
});
// app.patch('/matches', async function(req,res){
//     log('post /matches');
//     console.log(req.body);
//     var result = await data.NewMatch(req.body);

//     res.send({status:'ok',data:result});
// });

app.get('/matches/:id', async function(req,res){
    log('post /matches');
    var result = await data.readMatch(req.body);

    res.send({status:'ok',data:result});
});


app.listen(serverPort, function () {
    console.log(`app listening on port ${serverPort}`);
});
