var events = require('events');
var Firebolt = require('../skills/firebolt');
var Smash = require('../skills/smash');
const log = require('./logger');
const DataAPI = require('./DataAccess');
const MatchRecord = require('../models/matchRecord');
const dataApi = new DataAPI();
const {uuid} = require('uuidv4');
async function handle(room, user, data) {
    log('fired event:' + data.event);
    if (data.event == 'login' || data.event == 'quit') {
        log('game server stastics',{roomId:room.roomId, players:room.who(),updateTime:Date.now(), players:room.who().length},'gameEventHandler:handle','info');
        await dataApi.UpdateGameServerStastics({id:room.roomId,roomId:room.roomId, players:room.who(),updateTime:Date.now(), players:room.who().length});
        user.isOnline = (data.event == 'login');
        user.lastLoginTime = Date.now();
        log('online/offline',{roomId:room.roomId, player:user},'gameEventHandler:handle','info');
        await dataApi.UpdatePlayer(user);
    }else{
        await dataApi.UpdatePlayer(user);
    }
    dataApi.updateWorldwideMessages(user, '*', data.event);
}
async function handleMatchEvent(room, user, data) {
    //{actor:this._me, skill:this._me._skills[i].name,target:target,result:result}
    await dataApi.UpdatePlayer(user);
    log('match event:' + data.event,{damage:data.result.result.damage,data:data},'gaemEventHandler','debug');
    const match = new MatchRecord(user.playerId, data.result.target._playerId, uuid(),room.roomId, data.result.result.damage ,`${Date.now()}`);
    log('================',{match:match});
    await dataApi.NewMatch(match);
}
module.exports = class GameEventHandler {
    
    configureRoom(room, wserver, CLIENTS){
        //log('Configuring ROOM...');
        log('configuring new room', null,'GameEventHandler:configureRoom','info');
        room.setupBroadcaseHandler(function (name, message){
            log('broadcasting', `broadcasting to ${name}:${message}`,'GameEventHandler:configureRoom','info');
            if (name == '*') {
                dataApi.updateWorldwideMessages(name, '*', message);
                wserver.clients.forEach(ws => {
                    ws.send(message);
                });
            } else {
                room.players.forEach(ppl => {
                    log(`CHECKING ${ppl.name} with ${name}`,{},'','');
                    if (ppl.name == name) {
                        CLIENTS.get(ppl.name).send(message);
                        dataApi.updateWorldwideMessages(ppl.name, ppl.name, message);
                    }
                })
            }
        });
    }
    configurePlayer(player, room) {
        player.skills= ( [new Firebolt('firebolt'), new Smash('smash')]);
        player.on('*', async function (data){ await handle(room, player, {event:'hp', actor:player});});
        player.on('hp', async function (data){ await handle( room, player, {event:'hp', actor:player});});
        player.on('mp', async function (data){ await handle( room, player, {event:'mp', actor:player});});
        player.on('playerLv', async function (data){ await handle( room, player, {event:'playerLv', actor:player});});
        player.on('login', async function (data){ await handle(room, player, {event:'login', actor:player});});
        player.on('quit', async function (data){ await handle(room, player, {event:'quit', actor:player});});
        player.on('attack',async function (data){ await handleMatchEvent(room, player, {event:'attack', actor:player,result:data});});
    }
};
