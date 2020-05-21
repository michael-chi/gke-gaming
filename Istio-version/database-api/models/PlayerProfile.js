/*
    UUID STRING(36) NOT NULL,           -- UUID for this player, random, for distribution
    PlayerId STRING(36) NOT NULL,       -- Player readable Id, such as michael-chi
    Email STRING(64) NOT NULL,
    Nickname STRING(64) NOT NULL,
    Balance INT64 NULL,
    MobilePhoneNumber STRING(10) NOT NULL,
    BirthDay TIMESTAMP NOT NULL,
    HomeAddress STRING(64) NOT NULL,
    Gender STRING(1) NOT NULL,
    PasswordHash STRING(64) NOt NULL,
    Tag STRING(64) NULL,
    IsDisable BOOL NULL,
    DisableReason STRING(24) NULL,
    IsPromoted BOOL NULL,
    CreateTime TIMESTAMP NOT NULL,
*/

class PlayerProfile {
    constructor(id, email, nickname, lastLoginTime, online, shardId) {
        this._id = id ? id : Math.round(Math.random() * 10);//Math.floor(Math.random()*(9223372036854775807-1+1)+1);
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
