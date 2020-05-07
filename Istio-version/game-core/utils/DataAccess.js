const log = require('./logger');
const config = require('../models/config');
const bent = require('bent')

module.exports = class DataAccess {
    constructor() {
        this._local_mode = config.LOCAL_MODE;
        this._dataApi = config.DATAAPI_URL;
    }
    async post(uri, data){
        const post = bent(this._dataApi, 'POST', 'json', 200);
        var resp = await post(uri, data);

        return resp;
    }
    async get(uri){
        const getJSON = bent('json');
        let resp = await getJSON(`${this._dataApi}/${uri}`);
        return resp;
    }
    async patch(uri, data){
        const patch = bent(this._dataApi, 'PATCH', 'json');
        let resp = await patch(uri, data);

        return resp;
    }
    //==============================
    //  Spanner
    //==============================

    async ReadPlayerProfile(id)
    {
        var resp = await this.get(`profiles/${id}`);
        return resp;
    }
    UpdatePlayerProfile(player){
        var resp = await this.post(`profiles/${player.PlayerId}`);
        return resp;
    }
    async NewPlayerProfile(player){
        var resp = await this.post(`profiles/${player.PlayerId}`);
        return resp;
    }
    async NewMatch(records){
        var resp = await this.post('matches', JSON.stringify(records));

        return resp;
    }
    //==============================
    //  Firestore
    //==============================
    async EnsurePlayer(playerId){
        const player = await this.get(`players/${playerId}`);
        return player;
    }
    async UpdatePlayer(player){
        //updatePlayerState
        return await this.patch(`players/${player.PlayerId}`, player);
    }

    async UpdateGameServerStastics(info) {
        return await this.patch(`gameservers/${info.id}`);
    }
    async GetGameServerStastics(id){
        if(id){
            return await this.get(`gameseervers/${id}`);
        }else{
            return await this.get(`gameseervers`);
        }
    }
    
    updateWorldwideMessages(issuer, target, message) {
        //return this._firestore.updateWorldwideMessages(issuer, target, message);
        console.log(`========== updateWorldwideMessages Not Implemented YET ==========`);
    }
}