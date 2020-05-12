/*
    MatchId STRING(36) NOT NULL,
    PlayerId STRING(10) NOT NULL,
    TargetId STRING(64) NOT NULL,
    MatchTime TIMESTAMP NOT NULL,
    RoomId STRING(36) NOT NULL
    DAMAGE INT64 NOT NULL
*/
const { uuid } = require('uuidv4');
class MatchRecord {
    constructor(playerId, targetId, matchId, roomId, damage, matchTime) {
        this.PlayerId = playerId;
        this.TargetId = targetId;
        this.MatchId = matchId ? matchId : uuid();
        this.MatchTime = matchTime;
        this.RoomId = roomId;
        this.Damage = damage;
    }
    
    toJson(){
        return this;
    }
    toString(){
        return `==================\r\n[${this.MatchId}]${this.PlayerId} attacks ${this.TargetId} at ${this.MatchTime} in ${this.RoomId} causing ${this.Damage}`;
    }
};
module.exports = MatchRecord;
 