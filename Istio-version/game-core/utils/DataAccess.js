const log = require('./logger');
const config = require('../models/config');
const bent = require('bent')
const User = require('../models/user');

console.log(`================\r\n${config}\r\n=============`);
module.exports = class DataAccess {
    constructor() {
        this._local_mode = config.DataAccess().LOCAL_MODE;
        this._dataApi = config.DataAccess().DATAAPI_URL;
    }
    async post(uri, data){
        const post = bent(`${this._dataApi}`, 'POST', { 'content-type': 'application/json' }, 200);
        var resp = await post(`/${uri}`,data);
        var data = (await resp.json()).data;
        return resp;
    }
    async get(uri){
        const getJSON = bent('json');
        let resp = await getJSON(`${this._dataApi}/${uri}`);
        return resp;
    }
    async patch(uri, data){
        log('patch.........',{data:data},'','debug');
        const patch = bent(`${this._dataApi}`, 'PATCH', { 'content-type': 'application/json' });
        let resp = await patch(`/${uri}`,data);
        var data = (await resp.json()).data;
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
    async UpdatePlayerProfile(player){
        var resp = await this.post(`profiles/${player.PlayerId}`,player.toJson());
        return resp;
    }
    async NewPlayerProfile(player){
        var resp = await this.post(`profiles/${player.PlayerId}`,player.toJson());
        return resp;
    }
    async NewMatch(record){
        var resp = await this.post('matches', record.toJson());

        return resp;
    }
    //==============================
    //  Firestore
    //==============================
    async EnsurePlayer(playerId){
        try{
            const resp = await this.get(`players/${playerId}`);
            const player = resp.data;
            return new User(player.name, player.playerClass, player.hp, player.mp, player.playerLv, null, player.id);
        }catch(ex){
            log('error EnsurePlayer',{error:ex, playerId:playerId}, 'DataAccess:EnsuerPlayer','error');
            return null;
        }
    }
    async UpdatePlayer(player){
        //updatePlayerState
        log('UpdatePlayer',{player:player});
        return await this.post(`players/${player.id}`, (player.toJson()));
    }

    async UpdateGameServerStastics(info) {
        return await this.post(`gameservers/${info.id}`,info);
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