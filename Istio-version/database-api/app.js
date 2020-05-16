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
app.get('/', function (req, res) {
    res.send('ok');
});

//  Profile
//  * Input: modules/PlayerProfile
app.get('/profiles/:id', async function (req, res) {
    try {
        log('get /profiles/:id',{id:req.params.id});
        var user = await data.ReadPlayerProfile(req.params.id);
        res.send({ status: 'ok', data: user });
    } catch (e) {
        log('========', { error: e }, '/profiles/:id', 'debug');
        throw e;
    }

});
app.patch('/profiles/:id', function (req, res) {
    try {
        log('post /profiles/:id');
        data.UpdatePlayerProfile(req.body);
        res.send({ status: 'ok', data: req.body });
    } catch (e) {
        log('========', { error: e }, '/profiles/:id', 'debug');
        throw e;
    }

});
app.post('/profiles/', function (req, res) {
    try {
        log('post /profiles/', { body: req.body });
        data.NewPlayerProfile(req.body);
        res.send({ status: 'ok', data: req.body });
    } catch (e) {
        log('========', { error: e }, '/profiles/:id', 'debug');
        res.send({ status: 'error', error: e });
    }

});

//  Game Server
//  * Input: Any
app.get('/gameservers/:id', function (req, res) {

    try {
        log('get /gameserver/:id');
        var game = data.GetGameServerStastics(req.params.id);
        res.send({ status: 'ok', data: game });
    } catch (e) {
        log('========', { error: e }, '/profiles/:id', 'debug');
        throw e;
    }
});
app.get('/gameservers', function (req, res) {
    try {
        log('get /gameserver');
        var games = data.GetGameServerStastics();
        res.send({ status: 'ok', data: games });
    } catch (e) {
        log('========', { error: e }, '/profiles/:id', 'debug');
        throw e;
    }

});
app.post('/gameservers/:id', function (req, res) {
    try {
        log('post /gameserver/:id', { body: req.body }, 'post /gameserver/:id', 'info');
        data.UpdateGameServerStastics(req.body);

        res.send({ status: 'ok' });
    } catch (e) {
        log('========', { error: e }, '/profiles/:id', 'debug');
        throw e;
    }

});
app.patch('/gameservers/:id', function (req, res) {

    try {
        log('patch /gameserver/:id', { body: req.body }, 'patch /gameserver/:id', 'info');
        data.UpdateGameServerStastics(req.body);

        res.send({ status: 'ok' });
    } catch (e) {
        log('========', { error: e }, '/profiles/:id', 'debug');
        throw e;
    }

});

//  Player
//  * Input: models/user
app.get('/players/:id', async function (req, res) {
    try {
        log('get /players/:id',{id:req.params.id});
        var player = await data.EnsurePlayer(req.params.id);

        res.send({ status: 'ok', data: player });
    } catch (ex) {
        console.log(`===========\r\n${ex}`);
        throw ex;
    }
});

app.post('/players/:id', async function (req, res) {
    try {
        log('post /players/:id', { body: req.body });
        await data.UpdatePlayer(req.body);

        res.send({ status: 'ok' });
    } catch (e) {
        log('eeeeeeeeeeeeeeee', { error: e }, '', '');
        throw e;
    }

});
app.patch('/players/:id', async function (req, res) {
    try {
        log('post /players');
        await data.UpdatePlayer(req.body);

        res.send({ status: 'ok' });
    } catch (e) {
        log('eeeeeeeeeeeeeeee', { error: e }, '', '');
        throw e;
    }

});

//  Match
//  * Input: models/MatchRecord
app.post('/matches', async function (req, res) {
    try {
        log('post /matches');
        console.log(req.body);
        var result = await data.NewMatch(req.body);

        res.send({ status: 'ok', data: result });
    } catch (e) {
        log('eeeeeeeeeeeeeeee', { error: e }, '', '');
        throw e;
    }

});
//====  Shop
app.post('/shop_items/buy', async function(req, res){
    //  Buy item
    /*
        {
{"playerUUID":"00000464-19cc-4223-a533-5e84bc0f08f9","itemId":"4748012b-1e1c-4b68-8d08-0dc2275ba6b9","quantity":1}
        }
    */
    try {
        log('post /shop_items/buy', { body: req.body });
        var purchased = await data.BuyShopItem(req.body.playerUUID, req.body.itemId, req.body.quantity);
        log('post /shop_items/buy', { result: { status: 'ok' , result: purchased} });
        res.send({ status: 'ok' , data: purchased});
    } catch (e) {
        log('error post /shop_items', { error: e }, '', '');
        throw e;
    }
});

app.get('/shop_items', async function(req, res){
    try {
        log('get /shop_items');
        var result = await data.ListShopItems();
        log('get shop_items result',{result:result},'','debug');
        res.send({ status: 'ok', data: result });
    } catch (e) {
        log('error get /shop_items', { error: e }, 'get /shop_items', 'debug');
        throw e;
    }
});

app.post('/shop_items', async function(req, res){
    //  Buy item
    /*
        {
            PlayerID:'',
            IteemID:'',
            Quantity:''
        }
    */
    try {
        log('post /shop_items/', { body: req.body });
        await data.NewShopItems(req.body);

        res.send({ status: 'ok' });
    } catch (e) {
        log('error post /shop_items', { error: e }, '', '');
        throw e;
    }
});

//====  Match
app.get('/matches/:id', async function (req, res) {
    try {
        log('post /matches');
        var result = await data.readMatch(req.body);

        res.send({ status: 'ok', data: result });
    } catch (e) {
        log('eeeeeeeeeeeeeeee', { error: e }, '', '');
        throw e;
    }

});

process.on('uncaughtException', function (err) {
    console.log('Caught exception: ' + err);
});
app.listen(serverPort, function () {
    console.log(`app listening on port ${serverPort}`);
});
