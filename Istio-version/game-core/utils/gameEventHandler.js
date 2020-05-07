var events = require('events');
// const CloudSpanner = require('./spanner');
// const Firestore = require('./firestore_native');
var Firebolt = require('../skills/firebolt');
var Smash = require('../skills/smash');
const log = require('../utils/logger');
const DataAPI = require('./utils/DataAccess');

const dataApi = new DataAPI();

async function handle(room, user, data) {
    await spanner.writePlayerWithMutations(user);
    log('fired event:' + data.event);
    if (data.event == 'login' || data.event == 'quit') {
        dataApi.UpdateGameServerStastics(room.who());
    } else {
        dataApi.UpdatePlayer(user);
    }
    dataApi.updateWorldwideMessages(user, '*', data.event);
}
module.exports = class GameEventHandler {
    
    configureRoom(room, wserver, CLIENTS){
        //log('Configuring ROOM...');
        log('configuring new room', null,'GameEventHandler:configureRoom','info');
        room.setupBroadcaseHandler(function (name, message){
            log('configuring new room', `broadcasting to ${name}:${message}`,'GameEventHandler:configureRoom','info');
            if (name == '*') {
                dataApi.updateWorldwideMessages(name, '*', message);
                //firestore.updateWorldwideMessages(name, '*', message);
                wserver.clients.forEach(ws => {
                    ws.send(message);
                });
            } else {
                room.players.forEach(ppl => {
                    if (ppl.name == name) {
                        CLIENTS.get(ppl.name).send(message);
                        dataApi.updateWorldwideMessages(ppl.name, ppl.name, message);
                    }
                })
            }
        });
    }
    configurePlayer(player, room) {
        player.skills( [new Firebolt('firebolt'), new Smash('smash')]);
        player.on('*', async function (data){ await handle(room, player, {event:'hp', actor:player});});

        player.on('hp', async function (data){ await handle( room, player, {event:'hp', actor:player});});
        player.on('mp', async function (data){ await handle( room, player, {event:'mp', actor:player});});
        player.on('playerLv', async function (data){ await handle( room, player, {event:'playerLv', actor:player});});
        player.on('login', async function (data){ await handle(room, player, {event:'login', actor:player});});
        player.on('quit', async function (data){ await handle(room, player, {event:'quit', actor:player});});
        
    }
};
