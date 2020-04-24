"use strict";
require('dotenv').config();

//const Spanner = require('./utils/spanner');
const DataStoreFactory = require('./utils/dataStoreFactory');
const Room = require('./models/room');
const GameEventHandler = require('./utils/gameEventHandler');
const CommandManager = require('./skills/factory');
const log = require('./utils/logger');

const dataStoreFactory = new DataStoreFactory();
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

app.get('/', function (req, res) {
    res.send('ok');
});
var bootstrapper = new GameEventHandler();

//when a websocket connection is established
websocketServer.on('connection', async (ws, req) => {
    try {
        //send feedback to the incoming connection
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        log(req);
        const port = req.connection.remotePort;
        const clientName = ip + ':' + port;
        log('client connected', { clientName: `${clientName}` }, 'app.js:websocketServer:onConnect', 'info');
        if (room == null) {
            room = new Room(null);
            //room, firestore, ws, clients
            bootstrapper.configureRoom(room, websocketServer, CLIENTS);
        }
        ws.send(clientName + ' type login [name] to login to the game');
        ws.on('message', async function message(message) {
            try {
                log('message received', { clientName: `${clientName}`, message: message }, 'app.js:websocketServer:onMessage', 'info');

                //  Should implement a command/message pipeline to handler different level commands
                //  websocket connection level (login/quit) ->>
                //      game level ->>
                //          room level ->>
                //              player level.
                //  But not now...
                if (message.startsWith('login ')) {
                    var name = message.split(' ')[1];
                    var spanner = dataStoreFactory.getSpanner();
                    var user = await spanner.EnsurePlayer(name);
                    //var user = await Spanner.EnsurePlayer(name);
                    log('player login', { player: `${name}` }, 'app.js:websocketServer:onMessage(login)', 'info');

                    //  Setup event handler so we get everything happened in the game world
                    bootstrapper.configurePlayer(user, room);

                    user.login();

                    CLIENTS.set(user.name, ws);
                    CLIENT_SOCKETS.set(clientName, user.name);
                    room.join(user);
                } else if (message == 'quit') {
                    var me = room.players.get(CLIENT_SOCKETS.get(clientName));
                    //broadcast(CLIENT_SOCKETS.get(clientName), 'bye');
                    CLIENTS.delete(me.name);
                    CLIENT_SOCKETS.delete(clientName);

                    ws.close();
                    room.leave(me);
                    me.quit();

                    log('player quit', {player:me.name}, 'app.js:websocketServer:onMessage(quit)', 'info');

                }
                else {
                    var factory = new CommandManager(room.players.get(CLIENT_SOCKETS.get(clientName)),
                        function (name) {
                            return room.players.get(name);
                        },
                        room);
                    var msg = factory.do(message);
                    if (msg) {
                        room.broadcast(msg.notifyUser, msg.message);
                    }
                    else {
                        ws.send('what do you want to do ?');
                    }
                }
            } catch (e) {
                console.log('2');
                console.log(e);
            }
        });
    } catch (err) {
        console.log('1');
        console.log(err);
    }
});

//start the web server
server.listen(serverPort, () => {
    //console.log(`Websocket server started on port ` + serverPort);
    try{
        log(`Websocket server started on port ` + serverPort, null, 'app.js', 'info');
    }catch(ex){
        console.log(`error listening connection...`);
        log(`error when Websocket server starting on port ` + serverPort, ex, 'app.js', 'error');
    }
});