const log = require('./logger');
const config = require('./config');

function getFirestore(projectId) {
    log(`local mode is ${config.LOCAL_MODE}`);
    if (config.LOCAL_MODE) {
        log('mocking firestore');
        const mock = require('./mock/firestore_native');
        return new mock();
    } else {
        const Firestore = require('./firestore_native');
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
    async EnsurePlayer(name){
        return await this._spanner.EnsurePlayer(name);
    }
    async readPlayer(name){
        return await this._spanner.readPlayer(name);
    }
    updatePlayer(player){
        return this._spanner.updatePlayer(player);
    }
    async writePlayerWithMutationsAndSession(players){
        return this._spanner.writePlayerWithMutationsAndSession(players);
    }
    async async writePlayerWithMutations(players){
        return this._spanner.writePlayerWithMutations(players);
    }
    async newPlayer(player){
        return this._spanner.newPlayer(player);
    }

    //==============================
    //  Firestore
    //==============================
    updateGameWorldStastics(players) {
        return this._firestore.updateGameWorldStastics(players);
    }
    updatePlayerState(player) {
        return this._firestore.updatePlayerState(player);
    }
    updateWorldwideMessages(issuer, target, message) {
        return this._firestore.updateWorldwideMessages(issuer, target, message);
    }
}