const InGameMessage = require('../utils/inGameMessage.js');
const CONSTS = require('../models/Consts');
const log = require('../utils/logger');
const DB = require('../utils/DataAccess');

module.exports = class Shop{
    constructor(me){
        this._name = 'shop';
        this._me = me;
    }
    get name(){
        return this._name;
    }
    set name(value){
        this._name = value;
    }
    
    static IsSystem(){return false;}

    async command(fragments){
        const db = new DB();
        //  Supported commnads:
        //  - shop list
        //      * list available items currently on sale
        //  - shop buy <ITEMID>     
        //      * buy item from shop owner
        switch(fragments[1]){
            case 'list':
                var items = await db.ListShopItems();
                var text = [];
                items.forEach(item =>{
                    text.push(`[${item.ItemID}] ${item.ItemName}\t\t\t${item.ItemDesc}\t\t${item.Price}\t\tDiscount:${item.IsPromotion}`);
                })
                log('shop list result',{playere:this._me.name,msg: new InGameMessage(this._me.name, text.join('\r\n'))});

                return text.join('\r\n');
            case 'buy':
                //buy ItemId count
                var itemId = fragments[2];
                var quantity = parseInt(fragments[3]);
                var playerId = this._me.UUID;
                
                log('buy item',{itemId:itemId, quantity:quantity, playerUUID:playerId},'info','info');
                const result = await db.BuyShopItem(playerId,itemId,quantity);
                if(result){
                    return '[Shop Owner]Thank you for purchasing';
                }else{
                    return '[Shop Owner]Sorry, but the transaciton failed';
                }
                break;
        }
        return 'bye...';
    }
}