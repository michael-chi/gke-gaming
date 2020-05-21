const DB = require('../utils/DataAccess');
require('dotenv').config();
const db = new DB();

async function go(){
    var items = await db.ListShopItems();
    console.log(JSON.stringify(items));
    //playerUUID, playerId, itemId, quantity
    //
    var r = await db.BuyShopItem('223a6fbd-3fe1-42b3-a046-0a7c3c3b391d','4748012b-1e1c-4b68-8d08-0dc2275ba6b9',1);
    console.log(`result=${r}`);
}

go();