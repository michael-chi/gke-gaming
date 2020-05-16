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
        this._balance = online;
        this._shardId = shardId;
    }
    
    get PlayerId(){
        return this._id;
    }
    set PlayerId (value){
        this._id= value;
    }
    set Email(value){
        this._email = value;
    }
    get Email (){
        if (this._email) {
            return this._email;
        }
        else return '';
    }
    get Nickname(){
        return this._nickname;
    }

    set Nickname(value){
        this._nickname = value;
    }
    
    get Balance(){
        return this._balance;
    }
    set Balance(value){
        this._balance = value;
    }
    get ShardId (){
        return this._shardId;
    }
    set ShardId(value){
        this._shardId = value;
    }
    
    toString(){
        return `==================\r\n[${this.ShardId}]${this.PlayerId}\r\n--------------\r\nemail ${this.Email} ${this.Nickname}\r\nlastLoginTime:${this.LastLoginTime}\nonline:${this.IsOnline}\r\n==================`;
    }

    toJson(){
        return {
            Playerid: this._id, 
            Email : this._email,
            Nickname: this._nickname,
            Balance: this._balance,
            ShardId: this._shardId
        };
    }
};
module.exports = PlayerProfile;
