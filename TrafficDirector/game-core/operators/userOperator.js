const InGameMessage = require('../utils/inGameMessage');
const { uuid } = require('uuidv4');
var Emitter = require('events').EventEmitter;

var events = new Emitter();
var util = require('util');

const STATE_NORMAL = 'normal';
const STATE_DYING = 'dying';

class UserOperator {
    constructor(user) {
        this._user = user;
    }
    dying(){
        this._user.state = STATE_DYING;
        this._user._hp = 0;

        this.emit('dying', this);
    }
    resurrection(){
        this._user._state = STATE_NORMAL;
        this._user._hp = 200;

        this.emit('resurrection', {actor:this._user});
    }
    login(){
        this.emit('login',{actor:this._user});
        //  everytime the player logs in, ensure he is able to fight again...for demo purpose
        if(this._user._hp <= 0)
            this.resurrection();
    }
    quit(){
        this.emit('quit',{actor:this._user});
    }
};
util.inherits(User, Emitter);
module.exports = User;
