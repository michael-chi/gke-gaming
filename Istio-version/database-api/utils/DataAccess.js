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
    if (config.LOCAL_MODE == 'true') {
        log('mocking spanner');
        const mock = require('./mock/spanner');
        return new mock();
    } else {
        const CloudSpanner = require('./spannerV2');
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
    async _exec(msg, runSpanner){
        try{
            var start = Date.now();
            var result = await runSpanner();
            var span = Date.now() - start;
            log('spanner run time', {duration:span, function:msg},'DataAccess:_exec()','info');
            return result;
        }catch(e){
            log('error _exec',{error:e},'_exec','debug');
            throw e;
        }

    }
    async ReadPlayerProfile(id) {
        return await this._exec('ReadPlayerProfile', async () => {return await getSpanner().readUserProfiles(id);});
    }
    async UpdatePlayerProfile(player) {
        return await this._exec('UpdatePlayerProfile', async () => {return await getSpanner().updateUserProfiles(player);});
    }
    async NewPlayerProfile(player) {
        try{
            var result = await this._exec('NewPlayerProfile', async () => {
                return await getSpanner().newUserProfiles(player);
            });
            return result;
        }catch(ex){
            throw ex;
        }
    }
    async NewMatch(records) {
        try{
            var results =  await this._exec('NewMatch', async () => {return await getSpanner().newMatch(records);});
    
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