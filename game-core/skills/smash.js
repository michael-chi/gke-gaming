const Skill = require('./skill.js');
const User = require('../models/user.js');
const InGameMessage = require('../utils/inGameMessage.js');

module.exports = class Smash extends Skill {
    constructor(name){
        super(name);
    }

    getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }
    
    attack (me, target){
        var damage = getRandomInt(8);
        target.hp -= damage;

        var message = `${me.name} smashed on ${target.name} cause ${damage} damage!`;
        if(target.hp <= 0){
            target.dying();
            message += `. ${target.name} is dying`;
        }
        return new InGameMessage(message);
    }
}