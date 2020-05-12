const { Datastore } = require('@google-cloud/datastore');
const { uuid } = require('uuidv4');
const log = require('./logger');
const User = require('../models/user');

class FirestoreDatastore {
    constructor() {
        this.datastore = new Datastore();
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
    KEY() {
        return this.datastore.KEY;
    }
    async updateGameServerStastics(stastics) {
        log('updating game server stastics data', {stastics:stastics}, 'GameWorldRealtimeStatStorage:updateGameWorldStastics', 'info');
        const taskKey = this.datastore.key({
            namespace: 'mud',
            path: ['gameServer', stastics.id]
        });

        const entity = {
            key: taskKey,
            data: stastics
        };

        try {
            await this.datastore.save(entity);
            log(`game server stastics ${stastics.id} updated successfully.`, null, 'firestore_datastore.js:updateGameServerStastics()', 'info');
        } catch (err) {
            log('ERROR:', { error: err }, 'firestore_datastore.js:updateGameServerStastics()', 'error');

            throw err;
        }
        // let docRef = this.db.collection('GameWorldStastics').doc(`${uuid()}-${Date.now().toPrecision()}`);
        // let message = docRef.set({
        //     id: uuid(),
        //     time: Date.now(),
        //     players: players
        // });
    }
    async getGameServerStastics(id) {
        const key = this.datastore.key({
            namespace: 'mud',
            path: ['gameServer', id]
        });
        var game = await datastore.get(key);

        if (game) {
            return game.toJSON();
        } else {
            return null;
        }
    }
    async getGameServerStastics() {
        const query = this.datastore.createQuery('mud', 'gameServer');
        var games = await this.datastore.runQuery(query);
        if (games) 
        {
            var results = [];
            games.forEach(game => {
                results.push(game.toJSON());
            });
            return results;
        } else {
            return null;
        }
    }
    async deletePlayers() {
        const query = this.datastore.createQuery('mud', 'players');
        this.datastore.runQuery(query, (err, entities, info) => {
            entities.forEach(entity => {
                this.datastore.delete(entity[this.datastore.KEY]);
            })
        });
    }
    async getPlayer(playerId) {
        const key = this.datastore.key({
            namespace: 'mud',
            path: ['players', playerId]
        });
        var user = await this.datastore.get(key);
        if (user && user.length > 0) {
            return user[0];
            //var resp = Object.assign(new User(),user[0]);
            // var resp = new User(user[0].playerId,
            //     user[0].name,
            //     user[0].playerClass,
            //     user[0].hp,
            //     user[0].mp,
            //     user[0].playerLv,
            //     null,
            //     user[0].id
            // );
            //log('===>>>',{user:resp},'','');
            return resp;
        } else {
            return null;
        }
    }
    async getPlayers() {
        const query = this.datastore.createQuery('mud', 'players');
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
    _convertToEntity(item, namespace, path, getId){
        const taskKey = this.datastore.key({
            namespace: namespace,
            path: [path, getId(item)]
        });
        const entity = {
            key: taskKey,
            data: item
        };
        return entity;
    }
    _convertToEntities(items, namespace, path, getId){
        var target = [];
        if (items instanceof Array) {
            items.forEach(item => {
                const entity = this._convertToEntity(item, namespace, path, getId);
                target.push(entity);
            });
        } else {
            const entity = this._convertToEntity(items, namespace, path, getId);
            target.push(entity);
        }
        return target;
    }
    async upsertPlayer(player) {
        //TODO:
        var target = this._convertToEntities(player, 'mud', 'players', (item) => item.playerId);
        console.log('=========');
        console.log(JSON.stringify(target));
        try {
            await this.datastore.save(target);
            log(`Player ${player.playerId} created successfully.`, {player:player}, 'firestore_datastore.js:upsertPlayer()', 'info');
        } catch (err) {
            log('ERROR:', { error: err }, 'firestore_datastore.js:upsertPlayer()', 'error');

            throw err;
        }
    }
}

module.exports = FirestoreDatastore;