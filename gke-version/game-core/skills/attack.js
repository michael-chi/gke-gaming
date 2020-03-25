const InGameMessage = require('../utils/inGameMessage.js');
module.exports = class Attack{
    constructor(me){
        this._name = 'attack';
        this._me = me;
    }
    get name(){
        return this._name;
    }
    set name(value){
        this._name = value;
    }
    static IsSystem(){return false;}
    attack(target){
        if (!target) {
            broadcast(CLIENT_SOCKETS.get(clientName), 'There no one called ' + targetName);
        } else {
            if (this._me &&
                    this._me.state == 'normal') {
                var msg = this._me.attack(target);
                return msg;//new InGameMessage(this._me.name, msg);
            } else {
                return new InGameMessage('*', 'W#@$F...something went wrong!');
            }
        }        
    }
}