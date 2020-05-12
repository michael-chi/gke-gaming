const InGameMessage = require('../utils/inGameMessage.js');
const CONSTS = require('../models/Consts');
const log = require('../utils/logger');
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
                var msg = this.do_attack(target);
                return msg;
            } else {
                return new InGameMessage('*', 'W#@$F...something went wrong!');
            }
        }        
    }

    do_attack(target){
        console.log(`${this._me.name} | ${target.name}`)
        if(this._me._state != CONSTS.PlayerState.STATE_NORMAL){
            return new InGameMessage(this._me.name, 'you are dying, you can\'t do anything now...');
        }
        for(var i =0; i < this._me._skills.length; i++){
            if(Math.random() >= 0.2){
                log('checking skills....',{skills:JSON.stringify(this._me.skills[i])},'test','debug');
                var result = this._me.skills[i].attack(this._me, target);
                log('===============',{target:target});
                this._me.emit('attack', {actor:this._me, skill:this._me._skills[i].name,target:target,result:result.message});
                return new InGameMessage('*', result.message.message);
            }
        }
        this._me.emit('missed', {actor:this._me, skill:this._me._skills[i].name,target:target,result:null});
        return new InGameMessage('*', `${this._me.name} missed the shot...`);
    }
}