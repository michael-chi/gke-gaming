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
    async _exec(msg, data, runRestApi){
        try{
            var start = Date.now();
            var result = await runRestApi(data);
            var span = Date.now() - start;
            log('rest api run time', {duration:span, function:msg},'DataAccess:_exec()','info');
            return result;
        }catch(e){
            log('error _exec',{error:e},'_exec','debug');
            throw e;
        }

    }
    async post(uri, data){
        return await this._exec('post',data, async (d) => {
            const postJson = bent(`${this._dataApi}`, 'POST', { 'content-type': 'application/json' }, 200);
            var resp = await postJson(`/${uri}`,d);
            var body = (await resp.json()).data;
            return body;
        });
    }
    async get(uri){
        return await this._exec('get',null, async (d) => {
            const getJSON = bent('json');
            let resp = await getJSON(`${this._dataApi}/${uri}`);
            return resp;
        });
    }
    async patch(uri, data){
        return await this._exec('get',data, async (d) => {
            log('patch.........',{data:d},'','debug');
            const patch = bent(`${this._dataApi}`, 'PATCH', { 'content-type': 'application/json' });
            let resp = await patch(`/${uri}`,d);
            var body = (await resp.json()).data;
            return body;
        });
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
    async ListShopItems(){
        var resp = await this.get('shop_items');
        if(resp.status == 'ok'){
            return resp.data;
        }else{
            return null;
        }
    }
    async BuyShopItem(playerId, itemId, quantity){
        var resp = await this.post('shop_items/buy',{
            playerUUID:playerId,
            itemId:itemId,
            quantity:quantity
        });
        if(resp){
            return true;
        }else{
            return false;
        }
    }
    //==============================
    //  Firestore
    //==============================
    async EnsurePlayer(playerId){
        try{
            const resp = await this.get(`players/${playerId}`);
            const player = resp.data;
            log('EnsurePlayer REST API result',{playerId:playerId,player:player},'','debug');
            //return Object.assign(new User(), player);//new User(player.name, player.playerClass, player.hp, player.mp, player.playerLv, null, player.id);
            var user = new User(
                player.playerId,
                player.name,
                player.playerClass,
                player.hp,
                player.mp,
                player.playerLv,
                player.skills,
                player.UUID,
                player.createTime,
                player.lastLoginTime
            );
            user.tags = player.tags;
            user.isOnline = true;
            return user;
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