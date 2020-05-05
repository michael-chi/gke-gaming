/*
CREATE TABLE PlayerMatchHistory (
    ShardId INT64 NOT NULL,
    MatchId STRING(36) NOT NULL,
    PlayerId STRING(10) NOT NULL,
    TargetId STRING(64) NOT NULL,
    MatchTime TIMESTAMP NOT NULL,
) PRIMARY KEY (ShardId, MatchId);
*/
const { uuid } = require('uuidv4');
class matchRecord {
    constructor(id, targetId, matchId, shardId, matchTime) {
        this.id = id ? id : uuid();
        this.targetId = targetId;
        this.matchId = matchId;
        this.shardId = shardId;
        this.matchTime = matchTime;
    }
    get id(){
        return this.id;
    }
    set id(value){
        this.id = value;
    }
    get matchTime(){
        return this.matchTime;
    }
    set matchTime(value){
        this.matchTime = value;
    }
    get targetId (){
        if (this.targetId) {
            return this.targetId;
        }
        else return '';
    }
    set targetId(value){
        this.targetId = value;
    }
    get matchId(){
        return this.matchId;
    }
    set matchId(value){
        this.matchId = value;
    }
    get shardId (){
        return this.shardId;
    }
    set shardId(value){
        this.shardId = value;
    }
    
    toString(){
        return `==================\r\n[${this.shardId}]${this.matchId}\r\n--------------\r\nPlayer ${this.id} matches against ${this.targetId}\r\nmatchTime:${this.matchTime}\r\n==================`;
    }
};
module.exports = matchRecord;
