const InGameMessage = require('../utils/inGameMessage.js');

module.exports = class Look {
    constructor(room){
        this._name = 'look';
        this._room = room;
    }
    static IsSystem(){return true;}
    get name(){
        return this._name;
    }
    set name(value){
        this._name = value;
    }
    
    describe (me, target){
        if(target){
            return new InGameMessage(me.name,target.toString());
        }else{
            console.log(`>>${me.name}:A empty game room\r\nyou see ${this._room.who()} standing in this room.`);
            return new InGameMessage(me.name,`A empty game room\r\nyou see ${this._room.who()} standing in this room.`);
        }
    }
}