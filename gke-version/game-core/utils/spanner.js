const {Spanner}  = require('@google-cloud/spanner');
const User = require('../models/user');

Array.prototype.toString = function(){
    const temp = [];
    this.forEach( item => temp.push(`'${item}'`));
    return temp.join();
}
function default_read_formatter(row) {
    const result = row.toJSON({wrapNumbers:true});
    return new User(
        id = result['id'],
        name = result['username'],
        lv = parseInt(result['playerLv'].value),
        hp = parseInt(result['hp'].value),
        mp = parseInt(result['mp'].value),
        playerClass = result['playerClass']
    );
}
function default_write_formatter(row) {
    const result = row.toJSON({wrapNumbers:true});
    return {
        id: result['id'],
        username: result['username'],
        rank: parseInt(result['rank'].value),
        xp: parseInt(result['xp'].value)
    };
}
module.exports = class CloudSpanner {
    constructor(projectId, instanceId, databaseId, read_formatter, write_formatter) {
        this.read_formatter = read_formatter ? read_formatter : default_read_formatter;
        this.write_formatter = write_formatter ? write_formatter : default_write_formatter;
        this.spanner = new Spanner({
            projectId: projectId,
        });
        // Gets a reference to a Cloud Spanner instance
        this.instance = this.spanner.instance(instanceId);
        this.database = this.instance.database(databaseId);
    }

    async readPlayer(name) {
        var query = null;
        if(name instanceof Array){
            query = {
                sql: `select * from players where name in (${name.toString()})`
            };
        }else{
            query = {
                sql: `select * from players where name=@name`,
                params: {
                    name: name,
                  },
            };
        }

        const [rows] = await this.database.run(query);
        console.log(`Query: ${rows.length} found.`);
        const results = [];
        rows.forEach(row => results.push(this.read_formatter(row)));

        return results;
    }

    updatePlayer(player){
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
            } catch (err) {
                console.error('ERROR:', err);
            } finally {
                this.database.close();
            }
        });
    }
}

