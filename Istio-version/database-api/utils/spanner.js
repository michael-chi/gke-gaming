const { Spanner } = require('@google-cloud/spanner');
var PlayerProfile = require('../models/PlayerProfile');
var GameConfiguration = require('../models/config');
const MatchRecord = require('../models/matchRecord');
const log = require('./logger');
Array.prototype.toString = function () {
    const temp = [];
    this.forEach(item => temp.push(`'${item}'`));
    return temp.join();
}

function default_read_formatter(row) {
    const result = row.toJSON({ wrapNumbers: true });

    var user = new User(result['name'], result['playerClass'], parseInt(result['hp'].value),
        parseInt(result['mp'].value),
        parseInt(result['playerLv'].value),
        null,
        result['id']);
    log('read user data from datasource', user, 'CloudSpanner.js::default_read_formatter', 'info');
    return user;
}
function default_write_formatter(row) {

}


module.exports = class CloudSpanner {
    constructor(read_formatter, write_formatter) {
        try {
            const config = GameConfiguration.Spanner();
            console.log(JSON.stringify(config));
            this.read_formatter = read_formatter ? read_formatter : default_read_formatter;
            this.write_formatter = write_formatter ? write_formatter : default_write_formatter;
            this.spanner = new Spanner({
                projectId: config.PROJECT_ID,
            });
            // Gets a reference to a Cloud Spanner instance
            this.instance = this.spanner.instance(config.INSTANCE_ID);
            this.database = this.instance.database(config.DATABASE_ID);
        } catch (err) {
            log('error constructing CloudSpanner', err, 'CloudSpanner.js::constructor', 'error');
        }
    }
    async _querySpanner(query, callback) {
        var query = null;

        try {
            const [rows] = await await this.database.run(query);
            var results = [];
            results.forEach(
                callback(row, results)
            );
            return results;
        } catch (err) {
            log(`unable to read user profile`, { error: err, MatchId: id }, "spanner.js:readMatch", "info");
        } finally {
            await this.database.close();
        }
    }
    //====================
    /*
    CREATE TABLE PlayerMatchHistory (
        ShardId INT64 NOT NULL,
        MatchId STRING(36) NOT NULL,
        PlayerId STRING(10) NOT NULL,
        TargetId STRING(64) NOT NULL,
        MatchTime TIMESTAMP NOT NULL,
    ) PRIMARY KEY (ShardId, MatchId);
    */

    async readMatch(id) {
        var query = null;
        if (id)
            query = {
                sql: `SELECT ShardId, MatchId, PlayerId, TargetId, MatchTime FROM PlayerMatchHistory where MatchId='${id}'`,
            };
        else
            query = {
                sql: `SELECT ShardId, MatchId, PlayerId, TargetId, MatchTime FROM PlayerMatchHistory where ShardId between 0 and 100`,
            };
        var results = await this._querySpanner(query, (row, items) => {
            const json = row.toJSON();
            items.push(new MatchRecord(json.PlayerId, json.TargetId, json.MatchId, json.ShardId, json.MatchTime).toJson());
        });
        return results;
        // try {
        //     const [rows] = await this._querySpanner(query);//await this.database.run(query);
        //     var results = [];
        //     results.forEach(row => {
        //         const json = row.toJSON();
        //         users.push(new MatchRecord(json.PlayerId, json.TargetId, json.MatchId, json.ShardId, json.MatchTime).toJson());
        //     });
        //     return results;
        // } catch (err) {
        //     log(`unable to read user profile`, { error: err, MatchId: id }, "spanner.js:readMatch", "info");
        // } finally {
        //     await this.database.close();
        // }
    }
    async newMatch(records) {
        var target = [];
        if (records instanceof Array) {
            target = records;
        } else {
            target.push(records);
        }
        try {
            this.database.runTransaction(async (err, transaction) => {
                if (err) {
                    log('error newMatch', { error: err, player: player }, 'CloudSpanner.js:newMatch', 'error');
                    return;
                }
                try {
                    var targets = [];

                    target.forEach(async match => {
                        log('newMatch', { error: err, match: match }, 'CloudSpanner.js:newMatch', 'info');
                        targets.push({
                            ShardId: match.shardId,
                            MatchId: match.matchId,
                            PlayerId: match.playerId,
                            TargetId: match.targetId,
                            MatchTime: match.matchTime
                        });
                    });
                    await transaction.insert('PlayerMatchHistory', targets);
                    await transaction.commit();

                    return players;
                } catch (ex) {
                    log('newMatch exception', { error: ex }, 'CloudSpanner.js:newMatch', 'error');

                    throw ex;
                } finally {
                    this.database.close();
                }
            });
        } catch (e) {
            console.log('==========================================');
            console.log(e);
        }
        return players;
    }
    //====================
    /*
    CREATE TABLE UserProfile (
        ShardId INT64 NOT NULL,
        PlayerId STRING(36) NOT NULL,
        Email STRING(64) NOT NULL,
        Nickname STRING(64) NOT NULL,
        LastLoginTime TIMESTAMP NOT NULL, 
        IsOnLine BOOL NOT NULL
    ) PRIMARY KEY (ShardId, PlayerId);
    */
    async readUserProfiles(playerId) {
        var query = null;
        if (playerId)
            query = {
                sql: `SELECT ShardId, PlayerId, Email, Nickname, LastLoginTime, IsOnLine FROM UserProfile where PlayerId='${playerId}'`,
            };
        else
            query = {
                sql: `SELECT ShardId, PlayerId, Email, Nickname, LastLoginTime, IsOnLine FROM UserProfile where ShardId between 0 and 100`,
            };

        try {
            const [rows] = await this.database.run(query);
            var users = [];
            rows.forEach(row => {
                const json = row.toJSON();
                users.push(new PlayerProfile(json.PlayerId, json.Email, json.Nickname, json.LastLoginTime, json.IsOnLine, json.ShardId).toJSON());
            });
            return users;
        } catch (err) {
            log(`unable to read user profile`, { error: err, playerId: playerId }, "spanner.js:readUserProfiles", "info");
        } finally {
            await this.database.close();
        }
    }
    async newUserProfiles(players) {
        var target = [];
        if (players instanceof Array) {
            target = players;
        } else {
            target.push(players);
        }
        try {
            this.database.runTransaction(async (err, transaction) => {
                if (err) {
                    log('error newUserProfiles', { error: err, player: player }, 'CloudSpanner.js:newUserProfiles', 'error');
                    return;
                }
                try {
                    var targets = [];
                    target.forEach(async player => {
                        log('newUserProfiles', { error: err, player: player }, 'CloudSpanner.js:newUserProfiles', 'info');
                        targets.push({
                            ShardId: player.shardId,
                            PlayerId: player.id,
                            Email: player.email,
                            Nickname: player.nickname,
                            LastLoginTime: player.lastLoginTime,
                            IsOnLine: player.online
                        });
                    });
                    await transaction.insert('UserProfile', targets);
                    await transaction.commit();

                    return players;
                } catch (ex) {
                    log('newUserProfiles exception', { error: ex }, 'CloudSpanner.js:newUserProfiles', 'error');

                    throw ex;
                } finally {
                    this.database.close();
                }
            });
        } catch (e) {
            console.log('==========================================');
            console.log(e);
        }
        return players;
    }


    async updateUserProfiles(profile) {
        var target = [];
        if (profile instanceof Array) {
            target = profile;
        } else {
            target.push(profile);
        }
        try {
            this.database.runTransaction(async (err, transaction) => {
                if (err) {
                    log('error updateUserProfiles', { error: err, profile: profile }, 'CloudSpanner.js:updateUserProfiles', 'error');
                    //return;
                }
                try {
                    transaction.update('UserProfile', profile);

                    //await transaction.insert('UserProfile', targets);
                    await transaction.commit();

                    return profile;
                } catch (ex) {
                    log('newUserProfiles exception', { error: ex }, 'CloudSpanner.js:newUserProfiles', 'error');

                    throw ex;
                } finally {
                    this.database.close();
                }
            });
        } catch (e) {
            console.log('==========================================');
            console.log(e);
        }
        return profile;
    }
}

