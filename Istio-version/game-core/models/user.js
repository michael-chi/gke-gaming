const { uuid } = require('uuidv4');
var Emitter = require('events').EventEmitter;
//const GameEventHandler = require('../utils/gameEventHandler');

var events = new Emitter();
var util = require('util');


const CONSTS = require('./Consts');


class User {
    constructor(playerId, name, playerClass, hp, mp, lv, skills, id, createTime, lastLoginTime) {
        this._playerId = playerId;
        this._uuid = id ? id : uuid();
        this._name = name;
        this._class = playerClass;
        this._hp = hp;
        this._maxHp = hp;
        this._mp = mp;
        this._maxMp = mp;
        this._lv = lv;
        this._state = CONSTS.PlayerState.STATE_NORMAL;
        this._skills = null;//[new Firebolt(), new Smash()];
        this._isOnline = false;
        this.emit('new', this);
        this._lastLoginTime = lastLoginTime;
        this._createTime = createTime;
    }
    set profile(value){this._profile = value;}
    get profile(){return this._profile;}
    get maxHp(){return this._maxHp;}
    get maxMp(){return this._maxMp;}
    set maxHp(value){this._maxHp = value;}
    set maxMp(value){this._maxMp = value;}
    get createTime(){return this._createTime;}
    set createTime(value){this._createTime = value;}
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
        this._hp = this._maxHp;
        this._mp = this._maxMp;

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
    
    get playerId(){
        return this._playerId;
    }
    set playerId(value){
        this._playerId = value;
    }  
    get UUID(){
        return this._uuid;
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
    get tags(){return this._tags;}
    set tags(value){this._tags = value;}

    toJson(){
        return {
            UUID: this._uuid,
            maxHp: this._maxHp,
            maxMp: this._maxMp,
            playerId: this._playerId,
            hp: this._hp,
            mp: this._mp,
            playerLv: this._lv,
            playerClass: this._class,
            name: this._name,
            state: this._state,
            isOnline: this._isOnline,
            lastLoginTime: this._lastLoginTime,
            tags: this._tags,
            createTime: this._createTime
        };
    }
    toString(){
        return `==================\r\n${this.name}\r\n--------------\r\nlevel ${this.playerLv} ${this.playerClass}\r\nHP:${this.hp}\tMP:${this.mp}\r\nBalance:${this._profile.Balance}\r\n==================`;
    }
};
util.inherits(User, Emitter);
module.exports = User;
