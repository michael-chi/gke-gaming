"use strict";
require('dotenv').config();

const Spanner = require('./utils/spanner');
const Room = require('./models/room');
const GameEventHandler = require('./utils/gameEventHandler');
const CommandManager = require('./skills/factory');

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

        //  Should use a commnad + factory here, 
        //  but I am not writting a real game, 
        //  so this is good enough for me to do a demo...
        if (message.startsWith('login ')) {
            var name = message.split(' ')[1];         
            var user = await Spanner.EnsurePlayer(name);
            log(`created user object ${user.name}`);
            user.login();
            CLIENTS.set(user.name, ws);
            CLIENT_SOCKETS.set(clientName, user.name);
            room.join(user);
        } else if (message == 'quit') {
            var me = room.players.get(CLIENT_SOCKETS.get(clientName));
            broadcast(CLIENT_SOCKETS.get(clientName), 'bye');
            me.quit();
            CLIENT_SOCKETS.delete(clientName);
            CLIENTS.delete(me.name);
            ws.close();
        }
        else{
            var factory = new CommandManager(room.players.get(CLIENT_SOCKETS.get(clientName)),
                                                function(name){
                                                    return room.players.get(name);
                                                },
                                                room);
            var msg = factory.do(message);
            if(msg){
                broadcast(msg.notifyUser, msg.message);
            }
            else{
                ws.send('what do you want to do ?');
            }
        }
    });
});

//start the web server
server.listen(serverPort, () => {
    console.log(`Websocket server started on port ` + serverPort);
});