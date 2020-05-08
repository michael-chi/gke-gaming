const log = require('./logger');
const CONFIG = require('./config');
const config = CONFIG.Spanner();

function getFirestore(projectId) {
    log(`local mode is ${config.LOCAL_MODE}`);
    const Firestore = require('./firestore_datastore');
    return new Firestore();
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
        return new CloudSpanner();
    }
}

module.exports = class DataAccess {
    constructor() {
        this._local_mode = config.LOCAL_MODE;
        //this._spanner = getSpanner();
        //this._firestore = getFirestore(config.PROJECT_ID);
    }
    //==============================
    //  Spanner
    //==============================

    async ReadPlayerProfile(id) {
        return await getSpanner().readUserProfiles(id);
    }
    UpdatePlayerProfile(player) {
        return getSpanner().updatePlayer(player);
    }
    async NewPlayerProfile(player) {
        return getSpanner().newUserProfiles(player);
    }
    async NewMatch(records) {
        try{
            var results = await getSpanner().newMatch(records);
            console.log(`=============N==>${results}`);
    
            return results;
        }catch(e){
            log('error NewMatch',{error:e},'NewMatch','debug');
            throw e;
        }

    }
    //==============================
    //  Firestore
    //==============================
    async EnsurePlayer(playerId) {
        try {
            const player = await getFirestore().getPlayer(playerId);
            if (player) {
                log('EnsurePlayer succeed', {playerId:player.toJson()},'DataAccess:EnsuerPlayer','info');
                return player.toJson();
            } else {
                return null;
            }
        } catch (ex) {
            console.log(ex);
            throw ex;
        }
    }
    async UpdatePlayer(player) {
        try{
            await getFirestore(config.PROJECT_ID).upsertPlayer(player);
        }catch(ex){
            log('err--------',{error:err},'','debug');
        }
    }

    async UpdateGameServerStastics(info) {
        return await getFirestore(config.PROJECT_ID).updateGameServerStastics(info);
    }
    async GetGameServerStastics(id) {
        if (id) {
            return await getFirestore(config.PROJECT_ID).getGameServerStastics(id);
        } else {
            return await getFirestore(config.PROJECT_ID).getGameServerStastics();
        }
    }

    async UpdateWorldwideMessages(issuer, target, message) {
        return await getFirestore(config.PROJECT_ID).updateWorldwideMessages(issuer, target, message);
    }
}