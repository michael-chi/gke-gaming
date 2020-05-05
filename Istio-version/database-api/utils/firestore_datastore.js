const {Datastore} = require('@google-cloud/datastore');

const { uuid } = require('uuidv4');
const log = require('./logger');
admin.initializeApp({
    credential: admin.credential.applicationDefault()
});

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
        log('updating game world message', {issuer:issuer, target:target, message:message}, 'MockGameWorldRealtimeStatStorage:updateWorldwideMessages', 'info');
        
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
    async upsertPlayer(player) {
        const taskKey = this.datastore.key('Players');
        const entity = {
          key: taskKey,
          data: player
        //   data: [
        //     {
        //       name: 'created',
        //       value: new Date().toJSON(),
        //     },
        //     {
        //       name: 'description',
        //       value: description,
        //       excludeFromIndexes: true,
        //     },
        //     {
        //       name: 'done',
        //       value: false,
        //     },
        //   ],
        };
      
        try {
          await datastore.save(entity);
          console.log(`Players ${taskKey.id} created successfully.`);
        } catch (err) {
          console.error('ERROR:', err);
        }
      }
}

module.exports = FirestoreDatastore;