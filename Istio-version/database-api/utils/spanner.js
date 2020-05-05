const { Spanner } = require('@google-cloud/spanner');
var PlayerProfile = require('../models/PlayerProfile');
var GameConfiguration = require('../models/config');
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

    async EnsurePlayer(name) {
        const spanner = new CloudSpanner();
        var existing = await spanner.readPlayer(name);

        log('Ensuring Player exists', name, 'MockCloudSpanner.js::EnsurePlayer', 'info');

        if (!existing) {
            console.log(`creating new player in Spanner...`);
            var user = new User(name, 'Warrior', 120, 120, 1, null);
            existing = await spanner.writePlayerWithMutations(user);
            //existing = await spanner.newPlayer(user);
            log('New player, created database record', name, 'CloudSpanner.js::EnsurePlayer', 'info');
        }

        // var bootstrapper = new GameEventHandler();

        // bootstrapper.configure(existing, async function (data) {
        //     var spanner = newSpannerClient();
        //     //await spanner.updatePlayer(existing);
        //     await spanner.writePlayerWithMutations(existing);
        // });
        return existing;
    }
    async readPlayer(name) {
        var query = null;
        if (name instanceof Array) {
            query = {
                sql: `select * from players where name in (${name.toString()})`
            };
        } else {
            query = {
                sql: `select * from players where name=@name`,
                params: {
                    name: name,
                },
            };
        }
        log('reading player data from database', query, 'CloudSpanner.js::readPlayer', 'info');
        const [rows] = await this.database.run(query);

        log('reading player data from database', { hasPlayer: rows.length > 0, result: rows.length, name: name }, 'CloudSpanner.js::readPlayer', 'info');
        const results = [];
        rows.forEach(row => results.push(this.read_formatter(row)));
        console.log(results.length);
        if (results.length == 0) {
            return null;
        }
        else if (results.length == 1) {
            return results[0];
        }
        else
            return results;
    }

    updatePlayer(player) {
        this.database.runTransaction(async (err, transaction) => {
            if (err) {
                console.error('here' + err);
                return;
            }
            try {

                // console.log(`${player.name}|${player.id}|${player.playerClass}|${player.playerLv}|${player.hp}|${player.mp}`);
                // console.log(player);
                var query = {
                    //sql: `INSERT into players(id, name, playerClass, playerLv, hp, mp) values(@id, @name, @playerClass, @playerLv, @hp, @mp)`,
                    sql: `update players set playerLv=@playerLv, hp=@hp, mp=@mp where name=@name and id=@id`,
                    params: {
                        id: player.id,
                        name: player.name,
                        playerClass: player.playerClass,
                        playerLv: player.playerLv,
                        hp: player.hp,
                        mp: player.mp
                    }
                };
                const [rowCount] = await transaction.runUpdate(query);
                log('updating player data', query, 'CloudSpanner.js::updatePlayer', 'info');

                await transaction.commit();
            } catch (err) {
                log('updating player data', err, 'CloudSpanner.js::updatePlayer', 'error');

            } finally {
                this.database.close();
            }
        });
    }
    //  https://googleapis.dev/nodejs/spanner/latest/Database.html#getSessions
    //  It is unlikely we need to play around with sesisons, but here I want to explore how it works.
    async writePlayerWithMutationsAndSession(players) {
        var sessions = await this.database.getSessions();
        sessions.forEach(s => {
            //log('session', err,'CloudSpanner.js::writePlayerWithMutationsAndSession','error');
            log('====SESSION METADATA=====');
            console.log(s[0]);
            console.log(s[1]);
        }
        );
        const transaction = session.transaction();
        var target = [];
        try {
            if (players instanceof Array) {
                target = players;
            } else {
                target.push(players);
            }
            target.forEach(t => transaction.upsert('players', t));
            await transaction.commit();
        } catch (e) {
            log('error updating', e, 'CloudSpanner.js:writePlayerWithMutationsAndSession', 'error');
            transaction.end();
        }
        return players;
    }
    async writePlayerWithMutations(players) {
        //return await this.writePlayerWithMutationsAndSession(players);
        var playerTable = this.database.table('players');
        var target = [];
        if (players instanceof Array) {
            target = players;
        } else {
            target.push(players);
        }
        target.forEach(async (player) => {
            await playerTable.upsert([
                {
                    'id': player.id,
                    'name': player.name,
                    'playerClass': player.playerClass,
                    'playerLv': player.playerLv,
                    'hp': player.hp,
                    'mp': player.mp
                }
            ]);
        });
        return players;
    }

    async newPlayer(player) {
        this.database.runTransaction(async (err, transaction) => {
            if (err) {
                log('error newPlayer', { error: err, player: player }, 'CloudSpanner.js:newPlayer', 'error');
                return;
            }
            try {
                log('newPlayer', { error: err, player: player }, 'CloudSpanner.js:newPlayer', 'error');
                var query = {
                    sql: `INSERT into players(id, name, playerClass, playerLv, hp, mp) values(@id, @name, @playerClass, @playerLv, @hp, @mp)`,
                    params: {
                        id: player.id,
                        name: player.name,
                        playerClass: player.playerClass,
                        playerLv: player.playerLv,
                        hp: player.hp,
                        mp: player.mp
                    }
                };
                const [rowCount] = await transaction.runUpdate();

                await transaction.commit();
                log('newPlayer', query, 'CloudSpanner.js:newPlayer', 'info');

                return player;
            } catch (err) {
                log('newPlayer', { error: err, player: player }, 'CloudSpanner.js:newPlayer', 'error');

                throw err;
            } finally {
                this.database.close();
            }
        });

        return player;
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
    async readUserProfiles(playerId){
        var query = null;
        if(playerId)
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
                users.push(new PlayerProfile(json.PlayerId, json.Email, json.Nickname, json.LastLoginTime, json.IsOnLine, json.ShardId));
            });
            return users;
        } catch (err) {
            log(`unable to read user profile`, {error:err,playerId:playerId}, "spanner.js:readUserProfiles","info");
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
        try{
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
                        ShardId :player.shardId, 
                        PlayerId : player.id,
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
                log('newUserProfiles exception', { error: ex}, 'CloudSpanner.js:newUserProfiles', 'error');

                throw ex;
            } finally {
                this.database.close();
            }
        });
        }catch(e){
            console.log('==========================================');
            console.log(e);
        }
        return players;
    }

    /*
    CREATE TABLE UserProfile (
        ShardId INT64 NOT NULL,
        PlayerId STRING(10) NOT NULL,
        Email STRING(64) NOT NULL,
        Nickname STRING(64) NOT NULL,
        LastLoginTime TIMESTAMP NOT NULL, 
        IsOnLine BOOL NOT NULL
    ) PRIMARY KEY (ShardId, PlayerId);
    */

    async newUserProfile(player) {
        try {
            this.database.runTransaction(async (err, transaction) => {
                if (err) {
                    log('error newUserProfile', { error: err, player: player }, 'CloudSpanner.js:newUserProfile', 'error');
                    return;
                }

                log('newUserProfile', { error: err, player: player }, 'CloudSpanner.js:newUserProfile', 'error');
                var query = {
                    sql: `INSERT into UserProfile(ShardId, PlayerId, Email, Nickname, LastLoginTime, IsOnLine) values(@shardId, @id, @email, @nickname, @lastLoginTime, @online)`,
                    params: {
                        id: player.id,
                        email: player.email,
                        nickname: player.nickname,
                        lastLoginTime: player.lastLoginTime,
                        online: player.online,
                        shardId: player.shardId
                    }
                };
                const [rowCount] = await transaction.runUpdate(query);

                await transaction.commit();
                log('newPlayer', query, 'CloudSpanner.js:newPlayer', 'info');

                return player;

            });
        } catch (err) {
            log('newPlayer', { error: err, player: player }, 'CloudSpanner.js:newPlayer', 'error');

            //throw err;
        } finally {
            this.database.close();
        }
        return player;
    }
}

