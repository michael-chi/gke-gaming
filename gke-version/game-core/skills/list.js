const InGameMessage = require('../utils/inGameMessage.js');

module.exports = class Look {
    constructor(room){
        this._name = 'list';
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
        return new InGameMessage(me.name,`${JSON.stringify(this._room.who())}`);
    }
}