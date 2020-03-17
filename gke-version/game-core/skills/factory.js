module.exports = class SkillManager {
    constructor(issuer, findPlayerFunc){
        this.findPlayerFunc = findPlayerFunc;
        this.player = issuer;
    }
    parse(cmd){
        var fragments = cmd.split(' ');
        var target = fragments.length > 1 ? fragments[1]: null;
        var skill = fragments[0];

        const Skill = eval(`require('./${skill}');`);
        var skill = new Skill();

        if(skill.attack){
            var victim = this.findPlayerFunc(target);
            if(victim){
                skill.attack(this.issuer, victim);

            }
        }
    }
}