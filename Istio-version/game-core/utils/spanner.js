const { Spanner } = require('@google-cloud/spanner');
var User = require('../models/user');
var GameConfiguration = require('../models/config');
const log = require('./logger');
Array.prototype.toString = function () {
    const temp = [];
    this.forEach(item => temp.push(`'${item}'`));
    return temp.join();
}

function default_read_formatter(row) {
    const result = row.toJSON({ wrapNumbers: true });
    console.log(`default_read_formatter\r\n==============\r\n${JSON.stringify(result)}\r\n==============`);
    console.log(User);
    return new User(result['name'], result['playerClass'], parseInt(result['hp'].value),
        parseInt(result['mp'].value),
        parseInt(result['playerLv'].value),
        null,
        result['id']);
}
function default_write_formatter(row) {

}


module.exports = class CloudSpanner {
    constructor(read_formatter, write_formatter) {
        try {
            const config = GameConfiguration.Spanner();
            this.read_formatter = read_formatter ? read_formatter : default_read_formatter;
            this.write_formatter = write_formatter ? write_formatter : default_write_formatter;
            this.spanner = new Spanner({
                projectId: config.PROJECT_ID,
            });
            // Gets a reference to a Cloud Spanner instance
            this.instance = this.spanner.instance(config.INSTANCE_ID);
            this.database = this.instance.database(config.DATABASE_ID);
        } catch (err) {
            log('==================');
            log(err);
        }
    }

    static async EnsurePlayer(name) {
        const spanner = new CloudSpanner();
        var existing = await spanner.readPlayer(name);
        console.log(existing);
        console.log(`player alread exists:${existing != null && existing != 'undefined'}`);

        if (!existing) {
            console.log(`creating new player in Spanner...`);
            var user = new User(name, 'Warrior', 120, 120, 1, null);
            existing = await spanner.writePlayerWithMutations(user);
            //existing = await spanner.newPlayer(user);
            console.log(`creating new player in Spanner...done`);
            console.log(`============\r\n${existing.toString()}`);
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
        console.log(`SQL:${JSON.stringify(query)}`);
        const [rows] = await this.database.run(query);
        console.log(`Query: ${rows.length} found.`);
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
                console.log(`${player.name}|${player.id}|${player.playerClass}|${player.playerLv}|${player.hp}|${player.mp}`);
                console.log(player);
                const [rowCount] = await transaction.runUpdate({
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
                });

                await transaction.commit();
            } catch (err) {
                console.error('ERROR:', err);
            } finally {
                this.database.close();
            }
        });
    }
    //  https://googleapis.dev/nodejs/spanner/latest/Database.html#getSessions
    //  It is unlikely we need to play around with sesisons, but here I want to explore how it works.
    async writePlayerWithMutationsAndSession(players) {
        var sessions = await this.database.getSessions();
        sessions.forEach(s => {log('====SESSION METADATA=====');console.log(s[0]); console.log(s[1]);});
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
            log(`${JSON.stringify({ error: e, message: 'error while upsert by transaction' })}`);
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
                console.error('here' + err);
                return;
            }
            try {
                console.log(`${player.name}|${player.id}|${player.playerClass}|${player.playerLv}|${player.hp}|${player.mp}`);
                console.log(player);
                const [rowCount] = await transaction.runUpdate({
                    sql: `INSERT into players(id, name, playerClass, playerLv, hp, mp) values(@id, @name, @playerClass, @playerLv, @hp, @mp)`,
                    params: {
                        id: player.id,
                        name: player.name,
                        playerClass: player.playerClass,
                        playerLv: player.playerLv,
                        hp: player.hp,
                        mp: player.mp
                    }
                });

                await transaction.commit();
                return player;
            } catch (err) {
                console.error('ERROR:', err);
                throw err;
            } finally {
                this.database.close();
            }
        });

        return player;
    }
}

