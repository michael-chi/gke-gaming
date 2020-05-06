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
class MatchRecord {
    constructor(playerId, targetId, matchId, shardId, matchTime) {
        this._playerId = playerId;
        this._targetId = targetId;
        this._matchId = matchId ? matchId : uuid();
        this._shardId = shardId;
        this._matchTime = matchTime;
    }
    get playerId(){
        return this._playerId;
    }
    set playerId(value){
        this._playerId = value;
    }
    get matchTime(){
        return this._matchTime;
    }
    set matchTime(value){
        this._matchTime = value;
    }
    get targetId (){
        if (this._targetId) {
            return this._targetId;
        }
        else return '';
    }
    set targetId(value){
        this._targetId = value;
    }
    get matchId(){
        return this._matchId;
    }
    set matchId(value){
        this._matchId = value;
    }
    get shardId (){
        return this._shardId;
    }
    set shardId(value){
        this._shardId = value;
    }
    toJson(){
        return {
            playerId:this._playerId,
            targetId:this._targetId,
            matchId:this._matchId,
            matchTime:this._matchTime,
            shardId:this._shardId          
        }
    }
    toString(){
        return `==================\r\n[${this._shardId}]${this._matchId}\r\n--------------\r\nPlayer ${this._playerId} matches against ${this._targetId}\r\nmatchTime:${this._matchTime}\r\n==================`;
    }
};
module.exports = MatchRecord;
