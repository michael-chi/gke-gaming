/*
|  ShardId	| INT64 	| | ShardId 	|  
|  PlayerId | String | | Player ID |
|  Email | String | | Player's email |
|  Nickname | String | | Player's nick name |
|  LastLoginTime | Timestamp| | Last login time |
|  IsOnLine | BOOL | | Is the player currently online |
*/

class PlayerProfile {
    constructor(id, email, nickname, lastLoginTime, online, shardId) {
        this._id = id ? id : round(Math.random() * 10);//Math.floor(Math.random()*(9223372036854775807-1+1)+1);
        this._email = email;
        this._nickname = nickname;
        this._lastLoginTime = lastLoginTime;
        this._online = online;
        this._shardId = shardId;
    }
    
    get id(){
        return this._id;
    }
    set id (value){
        this._id= value;
    }
    set email(value){
        this._email = value;
    }
    get email (){
        if (this._email) {
            return this._email;
        }
        else return '';
    }
    get nickname(){
        return this._nickname;
    }

    set nickname(value){
        this._nickname = value;
    }
    get lastLoginTime (){
        return this._lastLoginTime;
    }
    set lastLoginTime(value){
        this._lastLoginTime = value;
    }
    get online(){
        return this._online;
    }
    set online(value){
        this._online = value;
    }
    get shardId (){
        return this._shardId;
    }
    set shardId(value){
        this._shardId = value;
    }
    
    toString(){
        return `==================\r\n[${this.shardId}]${this.id}\r\n--------------\r\nemail ${this.email} ${this.nickname}\r\nlastLoginTime:${this.lastLoginTime}\nonline:${this.online}\r\n==================`;
    }

    toJson(){
        return {
            Playerid: this._id, 
            Email : this._email,
            Nickname: this._nickname,
            LastLoginTime: this._lastLoginTime,
            IsOnLine: this._online,
            ShardId: this._shardId
        };
    }
};
module.exports = PlayerProfile;
