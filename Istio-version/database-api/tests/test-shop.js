const DB = require('../utils/DataAccess');
require('dotenv').config();
const db = new DB();

async function go(){
    var items = await db.ListShopItems();
    console.log(JSON.stringify(items));
}

go();