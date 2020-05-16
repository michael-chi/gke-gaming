const InGameMessage = require('../utils/inGameMessage.js');
const CONSTS = require('../models/Consts');
const log = require('../utils/logger');
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
        //  Supported commnads:
        //  - shop list
        //      * list available items currently on sale
        //  - shop buy <ITEMID>     
        //      * buy item from shop owner
        switch(fragments[1]){
            case 'list':
                const DB = require('../utils/DataAccess');
                const db = new DB();
                var items = await db.ListShopItems();
                var text = [];
                items.forEach(item =>{
                    text.push(`[${item.ItemID}] ${item.ItemName}\t\t\t${item.ItemDesc}\t\t${item.Price}\t\tDiscount:${item.IsPromotion}`);
                })
                log('shop list result',{playere:this._me.name,msg: new InGameMessage(this._me.name, text.join('\r\n'))});

                return text.join('\r\n');
            case 'buy':

                break;
        }
        return 'bye...';
    }
}