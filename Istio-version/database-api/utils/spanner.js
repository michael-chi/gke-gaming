const { Spanner } = require('@google-cloud/spanner');
var PlayerProfile = require('../models/PlayerProfile');
var GameConfiguration = require('../models/config');
const MatchRecord = require('../models/matchRecord');
const { uuid } = require('uuidv4');
const log = require('./logger');

const random = require('./random');

Array.prototype.toString = function () {
    const temp = [];
    this.forEach(item => temp.push(`'${item}'`));
    return temp.join();
}
Array.prototype.toRecords = function (callback) {
    return callback(this);
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
            this.read_formatter = read_formatter ? read_formatter : default_read_formatter;
            this.write_formatter = write_formatter ? write_formatter : default_write_formatter;
        } catch (err) {
            log('error constructing CloudSpanner', err, 'CloudSpanner.js::constructor', 'error');
        }
    }
    getSpannerDatabase() {
        try {
            const config = GameConfiguration.Spanner();
            var spanner = new Spanner({
                projectId: config.PROJECT_ID,
            });
            // Gets a reference to a Cloud Spanner instance
            var instance = spanner.instance(config.INSTANCE_ID);
            var database = instance.database(config.DATABASE_ID);

            return database;
        } catch (e) {
            log('error constructing CloudSpanner', { error: e }, 'CloudSpanner.js::initSpanner', 'error');
            throw e;
        }
    }
    async _runMutation(records, callback) {
        var target = [];
        if (records instanceof Array) {
            target = records;
        } else {
            target.push(records);
        }
        var database = null;
        try {
            database = this.getSpannerDatabase();
            database.runTransaction(async (err, transaction) => {
                if (err) {
                    console.log(err);
                    log('error _runMutation', { error: err, match: records }, 'CloudSpanner.js:_runMutation', 'error');
                    return;
                }
                try {
                    target.forEach(item =>{
                        callback(item, transaction);
                    }
                    );
                    await transaction.commit();
                } catch (ex) {
                    log('newMatch exception', { error: ex }, 'CloudSpanner.js:_runMutation:runTransaction', 'error');
                    throw ex;
                }finally{
                    database.close();
                }
            });
        } catch (e) {
            log('newMatch exception', { error: e }, 'CloudSpanner.js:_runMutation', 'error');
            throw e;
        } finally {
        }
    }
    async _querySpanner(query, callback) {
        try {
            var database = this.getSpannerDatabase();
            const [rows] = await database.run(query);
            var results = [];
            rows.forEach(
                row => callback(row, results)
            );
            return results;
        } catch (err) {
            log(`error _querySpanner`, { error: err, query: query }, "spanner.js:_querySpanner", "info");
            throw err;
        } finally {
            await database.close();
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
        console.log(`========>${results}`);
        return results;
        
    }
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
            var results = await this._querySpanner(query, (row, items) => {
                const json = row.toJSON();
                items.push(new PlayerProfile(json.PlayerId, json.Email, json.Nickname, json.LastLoginTime, json.IsOnLine, json.ShardId).toJson());
            });

            return results;
        } catch (err) {
            log(`unable to read user profile`, { error: err, playerId: playerId }, "spanner.js:readUserProfiles", "info");
            throw err;
        }
    }
    async newMatch(records) {
        var target = [];
        if (records instanceof Array) {
            records.forEach(match =>{
                target.push({
                    ShardId: random.randomArbitrary(0, 100),
                    MatchId: uuid(),
                    PlayerId: match.playerId,
                    TargetId: match.targetId,
                    MatchTime: match.matchTime
                });
            })
        } else {
            target.push(records);
        }
        try {
            await this._runMutation(target,
                async (match, tx) => {
                    await tx.insert('PlayerMatchHistory', match);
                });
            return target;
        } catch (e) {
            console.log(e);
            throw e;
        } finally {
        }
    }

    //====================
    
    
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

