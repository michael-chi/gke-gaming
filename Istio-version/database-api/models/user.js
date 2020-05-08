// const InGameMessage = require('../utils/inGameMessage');
const { uuid } = require('uuidv4');
var Emitter = require('events').EventEmitter;
//const GameEventHandler = require('../utils/gameEventHandler');

var events = new Emitter();
var util = require('util');


const STATE_NORMAL = 'normal';
const STATE_DYING = 'dying';


class User {
    constructor(name, playerClass, hp, mp, lv, skills, id) {
        this._id = id ? id : uuid();
        this._name = name;
        this._class = playerClass;
        this._hp = hp;
        this._mp = mp;
        this._lv = lv;
        this._state = STATE_NORMAL;
        this._self = this;
        this._skills = null;//[new Firebolt(), new Smash()];

        this.emit('new', this);
    }
    get state() {return this._state;}
    
    get id(){
        return this._id;
    }
    get name (){
        if (this._name) {
            return this._name;
        }
        else return '';
    }
    set name(value){
        this._name = value;
    }
    get playerClass (){
        if(!this._class){
            this._class = 'Warrior';
        }
        return this._class;
    }
    set playerClass(value){
        this._class = value;
    }
    get playerLv(){
        return this._lv;
    }
    set playerLv(value){
        this.emit('playerLv', {actor:this,value:value});
        this._lv = value;
    }
    get hp (){
        return this._hp;
    }
    set hp(value){
        console.log('hp changed');
        this.emit('hp', {actor:this,value:value});
        this._hp = value;
    }
    get mp (){
        return this._mp;
    }
    set mp(value){
        this.emit('mp', {actor:this,value:value});
        this._mp = value;
    }
    toString(){
        return `==================\r\n${this.name}\r\n--------------\r\nlevel ${this._lv} ${this.playerClass}\r\nHP:${this.hp}\tMP:${this.mp}\r\n==================`;
    }
    toJson(){
        return {
                id:this._id ,
                name:this._name,
                playerClass:this._class ,
                hp:this._hp ,
                mp:this._mp ,
                playerLv:this._lv ,
                state:this._state 
            }
    }
};
util.inherits(User, Emitter);
module.exports = User;
