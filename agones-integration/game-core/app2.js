"use strict";
const User = require('./models/user.js');
const Room = require('./models/room.js');

const AgonesSDK = require('@google-cloud/agones-sdk');
const agonesSDK = new AgonesSDK();
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var jsonParser = bodyParser.json();
const serverPort = 9999,
    http = require("http"),
    express = require("express"),
    app = express(),
    server = http.createServer(app),
    WebSocket = require("ws"),
    websocketServer = new WebSocket.Server({ server });

var room = null;
const CLIENTS = new Map();
const CLIENT_SOCKETS = new Map();

function log(msg) {
    console.log(`[GameServer]${msg}`);
}

function broadcast(name, message) {
    log(`broadcasting to ${name}:${message}`);
    if (name == '*') {
        websocketServer.clients.forEach(ws => {
            ws.send(message);
        });
    } else {
        room.players.forEach(ppl => {
            if (ppl.name == name) {
                CLIENTS.get(ppl.name).send(message);
            }
        })
    }
}

app.get('/', function (req, res) {
    res.send('ok');
});

const go = async () => {
    agonesSDK.watchGameServer((result) => {
        console.log('GameServer Update:\n\tname:', result.objectMeta.name, '\n\tstate:', result.status.state);
    });
    
    let healthInterval = setInterval(() => {
        agonesSDK.health();
        console.log('Health ping sent');
    }, 20000);
    
    await agonesSDK.ready();
    //when a websocket connection is established
    websocketServer.on('connection', (ws, req) => {
        //send feedback to the incoming connection
        const ip = req.connection.remoteAddress;
        const port = req.connection.remotePort;
        const clientName = ip + ':' + port;
        log(`${clientName} is connected`);
        if (room == null) {
            room = new Room(broadcast);
        }
        ws.send(clientName + ' type login [name] to login to the game');
        ws.on('message', function message(message) {
            log(`received message ${message}`);

            //  Should use a commnad factory here, but I am not writting a real game, so this is good enough for me to do a demo...
            if (message.startsWith('login ')) {
                var name = message.split(' ')[1];
                var user = new User(name, 'Warrior', 120, 120, 1, [new Firebolt('firebolt'), new Smash('smash')]);

                log(`created user object ${user.name}`);
                CLIENTS.set(user.name, ws);
                CLIENT_SOCKETS.set(clientName, user.name);
                room.join(user);
            } else if (message.startsWith('attack ')) {
                var targetName = message.split(' ')[1];
                var target = room.players.get(targetName);
                if (!target) {
                    broadcast(CLIENT_SOCKETS.get(clientName), 'There no one called ' + targetName);
                } else {
                    var me = room.players.get(CLIENT_SOCKETS.get(clientName));
                    if (me) {
                        var msg = me.attack(target);
                        broadcast(msg.notifyUser, msg.message);
                    } else {
                        broadcast(CLIENT_SOCKETS.get(clientName), 'W#@$F...something went wrong!');
                    }
                }
            } else if (message == 'stat') {
                var msg = room.players.get(CLIENT_SOCKETS.get(clientName)).toString();
                broadcast(CLIENT_SOCKETS.get(clientName), msg);
            } else if (message == 'quit') {
                broadcast(CLIENT_SOCKETS.get(clientName), 'bye');
            } else if (message == 'look') {
                broadcast(CLIENT_SOCKETS.get(clientName), 'You are in a game world.');
            } else {
                ws.send('what do you want to do ?');
            }

        });
    });

    //start the web server
    server.listen(serverPort, () => {
        console.log(`Websocket server started on port ` + serverPort);
    });
}

go();