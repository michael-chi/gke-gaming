const log = require('../utils/logger');
const InGameMessage = require('../utils/inGameMessage.js');
module.exports = class SkillManager {
    constructor(issuer, findPlayerFunc, room){
        this.findPlayerFunc = findPlayerFunc;
        this.player = issuer;
        this._room = room;
    }
    do(cmd){
        var fragments = cmd.split(' ');
        var target = fragments.length > 1 ? fragments[1]: null;
        var skill = fragments[0];
        console.log(`require('./${skill}')...`);
        const Skill = eval(`require('./${skill}');`);
        
        var victim = null;
        var skill = null;
        if(!Skill){
            log('invalid skill',{skill:skill, target:target, original:cmd}, 'SkillManager:do', 'info');
            return new InGameMessage(this.player.name,`What are you trying to do ?`);
        }
        if(Skill.IsSystem()){
            log('system skill',{skill:skill, target:target, original:cmd}, 'SkillManager:do', 'info');
            
            skill = new Skill(this._room);

        }else{
            log('player skill',{skill:skill, target:target, original:cmd}, 'SkillManager:do', 'info');
            skill = new Skill(this.player);
        }
        if(skill.attack){
            
            if(target){
                victim = this.findPlayerFunc(target);
            }
            if(victim){
                var msg = skill.attack(victim);
                log('attack',{skill:skill, target:target, original:cmd,message:msg}, 'SkillManager:do', 'info');
                return msg;
            }else{
                log('attack',{skill:skill, target:target, original:cmd, message:'no target'}, 'SkillManager:do', 'info');
                
                return new InGameMessage(this.player.name,`who are you looking at ?`);
            }
        }

        if(skill.describe){
            if(target){
                victim = this.findPlayerFunc(target);
            }
            return skill.describe(this.player, victim);
        }

        return null;
    }
}