const log = require('./logger');
const config = require('./config');

function getFirestore(projectId) {
    log(`local mode is ${config.LOCAL_MODE}`);
    if (config.LOCAL_MODE) {
        log('mocking firestore');
        const mock = require('./mock/firestore_native');
        return new mock();
    } else {
        const Firestore = require('./firestore_datastore');
        return new Firestore(projectId);
    }
}

function getSpanner() {
    log(`local mode is ${config.LOCAL_MODE}`);
    if (config.LOCAL_MODE) {
        log('mocking spanner');
        const mock = require('./mock/spanner');
        return new mock();
    } else {
        const CloudSpanner = require('./spanner');
        return  new CloudSpanner();
    }
}

module.exports = class DataAccess {
    constructor() {
        this._local_mode = config.LOCAL_MODE;
        this._spanner = getSpanner();
        this._firestore = getFirestore(config.PROJECT_ID);
    }
    //==============================
    //  Spanner
    //==============================

    async ReadPlayerProfile(id){
        return await this._spanner.readUserProfiles(id);
    }
    UpdatePlayerProfile(player){
        return this._spanner.updatePlayer(player);
    }
    async NewPlayerProfile(player){
        return this._spanner.newPlayerProfile(player);
    }
    async NewMatch(records){
        return this._spanner.newMatch(records);
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