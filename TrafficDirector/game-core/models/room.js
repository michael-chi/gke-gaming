const User = require('./user.js');
const Look = require('../skills/look');
var os = require("os");
var RANDOM = require('../utils/random');
module.exports = class Room
{
    constructor(broadcast){
        this._players = new Map();
        this._broadcast = broadcast;
        this._systemCommands = new Map();
        this._roomId = os.hostname() + '-' + RANDOM.randomString(5);
    }
    broadcast(name, message){
        this._broadcast(name,message);
    }
    setupBroadcaseHandler(broadcast){
        this._broadcast = broadcast;
    }
    who(){
        return Array.from(this._players.keys());
    }
    join(user){
        this._players.set(user.playerId, user);
        this._broadcast('*',`Yo! ${user.name}(${user.playerId}) just joined this match.`);
    }
    leave(user){
        this._broadcast('*',`Yo! ${user.name} just leave this match.`);
        console.log(`delete ${user.name} from collection:${this._players.delete(user.id)}`);
    }
    get roomId (){return this._roomId;}
    get players(){return this._players;}
 
    command(player, command){
        //  avaiable commands, attack {0}
        var cmd = command.split(' ')[0];
        var target = command.split(' ')[1];
        if(cmd != 'attack'){
            this._broadcast('*',`${user.name} don\'t know what to do.`);
        }else if(!this._players[target]){
            this._broadcast('*',`${user.name} can\'t find his/her target !`);
        }else{
            var message = player.attack(this._players[target]);
            this._broadcast('*',message);
        }
    }
}