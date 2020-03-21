const admin = require('firebase-admin');
const functions = require('firebase-functions');
const { uuid } = require('uuidv4');
//const User = require('../models/user');
//admin.initializeApp(functions.config().firebase);
admin.initializeApp({
    credential: admin.credential.applicationDefault()
  });
  
  
class GameWorldRealtimeStatStorage {
    constructor(projectId) {
        this.db = admin.firestore();
    }
    updateGameWorldStastics(players){
        let docRef = this.db.collection('GameWorldStastics').doc(`${uuid()}-${Date.now().toPrecision()}`);
        let message = docRef.set({
            id:uuid(),
            time:Date.now(),
            players:players
        });        
    }
    updateWorldwideMessages(issuer, target, message){
        console.log(`>>>>>>>>${issuer}|${target}|${message}`)
        var issuerName = '', targetName = '';
        if(!(typeof issuer == 'string')){
            issuerName = issuer.name;
        }else{
            issuerName = issuer;
        }
        if(!(typeof target == 'string')){
            targetName = target.name;
        }else{
            targetName = target == '*' ? "Everyone" : target;
        }
        console.log(`>>>>>>>>${issuer}|${target}|${message}`)
        let docRef = this.db.collection('GameWorldBrocast').doc(`${issuerName}-${targetName}-${Date.now().toPrecision()}`);
        let msg = docRef.set({
            id:uuid(),
            time:Date.now(),
            actor:issuerName,
            target:targetName,
            message:message
        });
    }
}

module.exports = GameWorldRealtimeStatStorage;