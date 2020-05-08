const InGameMessage = require('../utils/inGameMessage');
const { uuid } = require('uuidv4');
var Emitter = require('events').EventEmitter;
//const GameEventHandler = require('../utils/gameEventHandler');

var events = new Emitter();
var util = require('util');


const CONSTS = require('./Consts');


class User {
    constructor(name, playerClass, hp, mp, lv, skills, id) {
        this._id = id ? id : uuid();
        this._name = name;
        this._class = playerClass;
        this._hp = hp;
        this._mp = mp;
        this._lv = lv;
        this._state = CONSTS.PlayerState.STATE_NORMAL;
        this._skills = null;//[new Firebolt(), new Smash()];
        this._isOnline = false;
        this.emit('new', this);
        this._lastLoginTime = null;
    }
    get lastLoginTime(){return this._lastLoginTime;}
    set lastLoginTime(value){this._lastLoginTime = value;}
    get isOnline(){return this._isOnline;}
    set isOnline(value){this._isOnline = value;}
    get state() {return this._state;}

    get skills(){
        return this._skills;
    }
    set skills(value){
        this._skills = value;
    }

    dying(){
        this._state = CONSTS.PlayerState.STATE_DYING;
        this._hp = 0;

        this.emit('dying', this);
    }
    resurrection(){
        this._state = CONSTS.PlayerState.STATE_NORMAL;
        this._hp = 200;

        this.emit('resurrection', this);
    }
    
    login(){
        this.emit('login',this);
        //  everytime the player logs in, ensure he is able to fight again...for demo purpose
        if(this._hp <= 0)
            this.resurrection();
    }
    quit(){
        this.emit('quit',this);
    }
    // attack(target){
    //     console.log(`${this._self.name} | ${target.name}`)
    //     if(this._self._state != CONSTS.PlayerState.STATE_NORMAL){
    //         return new InGameMessage(this._self.name, 'you are dying, you can\'t do anything now...');
    //     }
    //     for(var i =0; i < this._skills.length; i++){
    //         if(Math.random() >= 0.2){
    //             this.emit('attack', {actor:this, skill:this._skills[i].name});
    //             return this._skills[i].attack(this._self, target);
    //         }else{
    //             this.emit('missed', {actor:this});
    //         }
    //     }
    //     return new InGameMessage('*', `${this._self.name} stands still...`);
    // }
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
    toJson(){
        return {
            id: this._id,
            hp: this._hp,
            mp: this._mp,
            playerLv: this._lv,
            playerClass: this._class,
            name: this._name,
            state: this._state,
            isOnline: this._isOnline,
            lastLoginTime: this._lastLoginTime
        };
    }
    toString(){
        return `==================\r\n${this.name}\r\n--------------\r\nlevel ${this.playerLv} ${this.playerClass}\r\nHP:${this.hp}\tMP:${this.mp}\r\n==================`;
    }
};
util.inherits(User, Emitter);
module.exports = User;
