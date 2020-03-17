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

        const Skill = eval(`require('./${skill}');`);
        
        var victim = null;
        var skill = null;
        if(!Skill){
            return new InGameMessage(this.player.name,`What are you trying to do ?`);
        }
        if(Skill.IsSystem()){
            skill = new Skill(this._room);

        }else{
            skill = new Skill(this.player);
        }
        if(skill.attack){
            if(target){
                victim = this.findPlayerFunc(target);
            }
            if(victim){
                return skill.attack(target);
            }else{
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