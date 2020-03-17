"use strict";
const Spanner = require('./utils/spanner.js');
const Room = require('./models/room.js');

const GameEventHandler = require('./utils/gameEventHandler');

const serverPort = 9999,
    http = require("http"),
    express = require("express"),
    app = express(),
    server = http.createServer(app),
    WebSocket = require("ws"),
    websocketServer = new WebSocket.Server({ server });

var room = null;
const eventHandler = new GameEventHandler();


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
app.get('/', function(req,res){
  res.send('ok');  
});


//when a websocket connection is established
websocketServer.on('connection', async (ws, req) => {
    //send feedback to the incoming connection
    const ip = req.connection.remoteAddress;
    const port = req.connection.remotePort;
    const clientName = ip + ':' + port;
    log(`${clientName} is connected`);
    if (room == null) {
        room = new Room(broadcast);
    }
    ws.send(clientName + ' type login [name] to login to the game');
    ws.on('message', async function message(message) {
        log(`received message ${message}`);

        //  Should use a commnad factory here, but I am not writting a real game, so this is good enough for me to do a demo...
        if (message.startsWith('login ')) {
            var name = message.split(' ')[1];
            
            var user = await Spanner.EnsurePlayer(name);
            
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
            CLIENT_SOCKETS.get(clientName).close();
        } else if (message == 'look') {
            broadcast(CLIENT_SOCKETS.get(clientName), 'You are in a game world.');
            broadcast(CLIENT_SOCKETS.get(clientName),  `you see ${room.who()} standing in this room` );
        } else {
            ws.send('what do you want to do ?');
        }

    });
});

//start the web server
server.listen(serverPort, () => {
    console.log(`Websocket server started on port ` + serverPort);
});