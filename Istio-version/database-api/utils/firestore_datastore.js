const { Datastore } = require('@google-cloud/datastore');
const { uuid } = require('uuidv4');
const log = require('./logger');


class FirestoreDatastore {
    constructor() {
        this.datastore = new Datastore();
    }
    updateGameWorldStastics(players) {
        log('updating game world stastics data', players, 'GameWorldRealtimeStatStorage:updateGameWorldStastics', 'info');

        let docRef = this.db.collection('GameWorldStastics').doc(`${uuid()}-${Date.now().toPrecision()}`);
        let message = docRef.set({
            id: uuid(),
            time: Date.now(),
            players: players
        });
    }
    updatePlayerState(player) {
        log('updating game player data', player, 'GameWorldRealtimeStatStorage:updatePlayerState', 'info');

        let docRef = this.db.collection('PlayerState').doc(`${player.name}`);
        let msg = docRef.set({
            id: uuid(),
            name: player.name,
            class: player.playerClass,
            level: player.playerLv,
            hp: player.hp,
            mp: player.mp,
            time: Date.now()
        });
    }
    updateWorldwideMessages(issuer, target, message) {
        log('updating game world message', { issuer: issuer, target: target, message: message }, 'MockGameWorldRealtimeStatStorage:updateWorldwideMessages', 'info');

        //console.log(`>>>>>>>>${issuer}|${target}|${message}`)
        var issuerName = '', targetName = '';
        if (!(typeof issuer == 'string')) {
            issuerName = issuer.name;
        } else {
            issuerName = issuer;
        }
        if (!(typeof target == 'string')) {
            targetName = target.name;
        } else {
            targetName = target == '*' ? "Everyone" : target;
        }
        //console.log(`>>>>>>>>${issuer}|${target}|${message}`)
        let docRef = this.db.collection('GameWorldBrocast').doc(`${issuerName}-${targetName}-${Date.now().toPrecision()}`);
        let msg = docRef.set({
            id: uuid(),
            time: Date.now(),
            actor: issuerName,
            target: targetName,
            message: message
        });
    }
    //================
    KEY(){
        return this.datastore.KEY;
    }
    async deeletePlayers() {
        const query = this.datastore.createQuery('mud','players');
        this.datastore.runQuery(query, (err, entities, info) => {
            entities.forEach(entity => {
                this.datastore.delete(entity[this.datastore.KEY]);
            })
        });
    }
    async getPlayer(playerId){
        const key = this.datastore.key({
            namespace: 'mud',
            path: ['players', playerId]
        });
        var user = await datastore.get(key);

        if(user){
            return new User(user.nickname,
                        Classes[playerClass],
                        MaxHP[playerClass],
                        MaxMP[playerClass],
                        10,
                        null,
                        user.id
                    );
        }else{
            return null;
        }
    }
    async getPlayers() {
        const query = this.datastore.createQuery('mud','players');
        return await this.datastore.runQuery(query);
    }
    async delete(key) {
        const transaction = this.datastore.transaction();
        transaction.run((err) => {
            if (err) {
                // Error handling omitted.
            }

            transaction.delete(key);

            transaction.commit((err) => {
                if (!err) {
                    // Transaction committed successfully.
                }
            });
        });

    }
    async upsertPlayer(player) {
        const taskKey = this.datastore.key({
            namespace: 'mud',
            path: ['players', player.id]
        });

        const entity = {
            key: taskKey,
            data: player
        };

        try {
            await this.datastore.save(entity);
            log(`Player ${player.id} created successfully.`, null, 'firestore_datastore.js:upsertPlayer()', 'info');
        } catch (err) {
            log('ERROR:', { error: err }, 'firestore_datastore.js:upsertPlayer()', 'error');

            throw err;
        }
    }
}

module.exports = FirestoreDatastore;