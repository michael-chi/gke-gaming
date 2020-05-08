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
        var Skill = null;
        
        try{
            Skill = eval(`require('./${skill}');`);
        }catch(ex){
            log(`cannot find skill ${skill}`,{command:cmd,player:this.player.id},'SkillManager:do','error');
            Skill = null;
        }
        
        var victim = null;
        var skill = null;
        if(!Skill){
            log('invalid skill',{player:this.player.name,skill:null, target:target, original:cmd}, 'SkillManager:do', 'info');
            return new InGameMessage(this.player.name,`What are you trying to do ?`);
        }
        if(Skill.IsSystem()){
            skill = new Skill(this._room);
            log('system skill',{player:this.player.name,skill:skill.name, target:target, original:cmd}, 'SkillManager:do', 'info');
        }else{
            skill = new Skill(this.player);
            log('player skill',{player:this.player.name,skill:skill.name, target:target, original:cmd}, 'SkillManager:do', 'info');
        }
        if(skill.attack){
            
            if(target){
                victim = this.findPlayerFunc(target);
            }
            if(victim){
                var msg = skill.attack(victim);
                log('attack',{player:this.player.name,skill:skill.name, target:target, original:cmd,message:msg}, 'SkillManager:do', 'info');
                return msg;
            }else{
                log('attack',{player:this.player.name,skill:skill.name, target:target, original:cmd, message:'no target'}, 'SkillManager:do', 'info');
                return new InGameMessage(this.player.name,`who are you looking at ?`);
            }
        }

        if(skill.describe){
            if(target){
                victim = this.findPlayerFunc(target);
            }
            console.log(`${this.player}`);
            log('describe',{player:this.player.name,skill:skill.name, target:target, original:cmd, message:'no target'}, 'SkillManager:do', 'info');
            return skill.describe(this.player, victim);
        }

        return null;
    }
}