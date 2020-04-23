const InGameMessage = require('../utils/inGameMessage.js');

module.exports = class Look {
    constructor(room){
        this._name = 'login';
        this._room = room;
    }
    get name(){
        return this._name;
    }
    set name(value){
        this._name = value;
    }
    static IsSystem(){return false;}
    
    describe (me, target){
        if(me){
            return new InGameMessage(me.name,me.toString());
        }else{
            return `>>> somehow you cannot feel yourself...`;
        }
    }
}