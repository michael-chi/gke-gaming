const log = require('./logger');
const config = require('../models/config');
const request = require('request-promise');



module.exports = class DataAccess {
    constructor() {
        this._local_mode = config.LOCAL_MODE;
        //this._spanner = getSpanner();
        this._firestore = getFirestore(config.PROJECT_ID);
    }
    //==============================
    //  Spanner
    //==============================

    async ReadPlayerProfile(id){
        return await getSpanner().readUserProfiles(id);
    }
    UpdatePlayerProfile(player){
        return getSpanner().updatePlayer(player);
    }
    async NewPlayerProfile(player){
        return getSpanner().newPlayerProfile(player);
    }
    async NewMatch(records){
        var results = await getSpanner().newMatch(records);
        console.log(`=============N==>${results}`);

        return results;
    }
    //==============================
    //  Firestore
    //==============================
    async EnsurePlayer(playerId){
        const player = await this._firestore.getPlayer(playerId);
        if(player){
            return player.toJson();
        }else{
            return null;
        }
    }
    async UpdatePlayer(player){
        //updatePlayerState
        await this._firestore.upsertPlayer(player);
    }

    UpdateGameServerStastics(info) {
        return this._firestore.updateGameServerStastics(info);
    }
    GetGameServerStastics(id){
        if(id){
            return this._firestore.getGameServerStastics(id);
        }else{
            return this._firestore.getGameServerStastics();
        }
    }
    
    updateWorldwideMessages(issuer, target, message) {
        return this._firestore.updateWorldwideMessages(issuer, target, message);
    }
}