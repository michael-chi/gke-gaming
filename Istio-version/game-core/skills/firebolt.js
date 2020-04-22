//const Skill = require('./skill.js');
const User = require('../models/user.js');
const InGameMessage = require('../utils/inGameMessage.js');
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}
module.exports = class FireBolt {
    constructor(name){
        this._name = name;
    }
    get name(){
        return this._name;
    }
    set name(value){
        this._name = value;
    }
    static IsSystem(){return false;}
    
    
    attack (me, target){
        var damage = getRandomInt(12);
        target.hp -= damage;

        var message = `${me.name} cast firebolt on ${target.name} cause ${damage} damage!`;
        if(target.hp <= 0){
            target.dying();
            message += `. ${target.name} is dying`;
        }
        return new InGameMessage('*',message);
    }
}