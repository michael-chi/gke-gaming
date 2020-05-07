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
        const post = bent(`${this._dataApi}/${uri}`, 'POST', 'json', 200);
        var resp = await post(data);

        return resp;
    }
    async get(uri){
        const getJSON = bent('json');
        let resp = await getJSON(`${this._dataApi}/${uri}`);
        return resp;
    }
    async patch(uri, data){
        const patch = bent(`${this._dataApi}/${uri}`, 'PATCH', 'json');
        let resp = await patch(data);

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
        try{
            const resp = await this.get(`players/${playerId}`);
            const player = resp.data;
            return new User(player.name, player.playerClass, player.hp, player.mp, player.playerLv, null, player.id);
            //var resp = Object.assign(new User('','','','','',null,''), player.data);
            //log('------',{resp:resp},'','');
            //return resp;
        }catch(ex){
            log('error EnsurePlayer',{error:ex, playerId:playerId}, 'DataAccess:EnsuerPlayer','error');
            return null;
        }
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