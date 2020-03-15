const InGameMessage = require('../utils/inGameMessage.js');
const STATE_NORMAL = 'normal';
const STATE_DYING = 'dying';

module.exports = class User {
    constructor(name, playerClass, hp, mp, lv, skills) {
        this._name = name;
        this._class = playerClass;
        this._hp = hp;
        this._mp = mp;
        this._lv = lv;
        this._state = STATE_NORMAL;
        this._self = this;
        this._skills = skills;
    }
    dying(){
        this._state = STATE_DYING;
        this._hp = 0;
    }
    resurrection(){
        this._state = STATE_NORMAL;
        this._ = 200;
    }
    skills(){
        return this._skills;
    }
    attack(target){
        if(this._self._state != STATE_NORMAL){
            return new InGameMessage(this._self.name, 'you are dying, you can\'t do anything now...');
        }
        for(var i =0; i < this._skills.length; i++){
            if(Math.random() >= 0.2){
                return this._skills[i].attack(this._self, target);
            }
        }
        return new InGameMessage('*', `${this._self.name} stands still...`);
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
        return this._level;
    }
    set playerLv(value){
        this._level = value;
    }
    get hp (){
        return this._hp;
    }
    set hp(value){
        this._hp = value;
    }
    get mp (){
        return this._mp;
    }
    set mp(value){
        this._mp = value;
    }
    toString(){
        return `${this.name}\r\n=========\r\nlevel ${this._lv} ${this.playerClass}\r\nHP:${this.hp}\tMP:${this.mp}`;
    }
}
