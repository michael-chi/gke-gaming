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
const { uuid } = require('uuidv4');
class PlayerProfile {
    constructor(guid, id, email, nickname, 
                    balance, phone, birthday,
                    homeAddr, 
                    gender, passwordHash, tags,
                    isdisable, disableReason,
                    isPromoted, createTime) {
        this.UUID = guid ? guid : uuid();
        this.PlayerId = id;
        this.Email = email;
        this.Nickname = nickname;
        this.HomeAddress = homeAddr;
        this.Gender = gender;
        this.PasswordHash = passwordHash;
        this.Tag = tags;
        this.IsDisable = isdisable;
        this.DisableReason = disableReason;
        this.IsPromoted = isPromoted;
        this.CreateTime = createTime;
    }
    
    
    toString(){
        return `==================\r\n[${this.UUID}]${this.PlayerId}\t (${this.Gender})\r\n--------------\r\nEmail: ${this.Nickname}(${this.Email})\r\Created at:${this.CreateTime}\r\nIs Disabled:${this.IsDisable}(${this.DisableReason})\r\n==================`;
    }

    toJson(){
        return this;
    }
};
module.exports = PlayerProfile;
