const DBAccess = require('../database-api/utils/DataAccess');
const db = new DBAccess();
const {uuid} = require('../database-api/node_modules/uuidv4');
require('../database-api/node_modules/dotenv').config();
const CREATE_TIME = 'spanner.commit_timestamp()';
const Weapons = [
    {
        ItemID: uuid(),
        CreateTime: CREATE_TIME,
        IsEnabled: true,
        IsPromotion: false,
        ItemDesc: 'A magical long sword',
        ItemName: 'Long Sword + 1',
        ItemType: 'Weapon',
        Price: 100
    },
    {
        ItemID: uuid(),
        CreateTime: CREATE_TIME,
        IsEnabled: true,
        IsPromotion: false,
        ItemDesc: 'A powerful magical long sword',
        ItemName: 'Long Sword + 2',
        ItemType: 'Weapon',
        Price: 200
    },
    {
        ItemID: uuid(),
        CreateTime: CREATE_TIME,
        IsEnabled: true,
        IsPromotion: false,
        ItemDesc: 'A magical long sword with fire',
        ItemName: 'Long Sword of Fire + 1',
        ItemType: 'Weapon',
        Price: 300
    },
    {
        ItemID: uuid(),
        CreateTime: CREATE_TIME,
        IsEnabled: true,
        IsPromotion: true,
        ItemDesc: 'A magical dagger',
        ItemName: 'Dagger + 1',
        ItemType: 'Weapon',
        Price: 100
    },
    {
        ItemID: uuid(),
        CreateTime: CREATE_TIME,
        IsEnabled: true,
        IsPromotion: false,
        ItemDesc: 'A magical hammer made by lightening',
        ItemName: 'Storm Breaker',
        ItemType: 'Weapon',
        Price: 1500
    }
];
const Potions = [
    {
        ItemID: uuid(),
        CreateTime: CREATE_TIME,
        IsEnabled: true,
        IsPromotion: false,
        ItemDesc: 'Recover small amount of your HP',
        ItemName: 'Potion of rain drops',
        ItemType: 'Potion',
        Price: 200
    },
    {
        ItemID: uuid(),
        CreateTime: CREATE_TIME,
        IsEnabled: true,
        IsPromotion: true,
        ItemDesc: 'Recover your HP',
        ItemName: 'Healing Potion',
        ItemType: 'Potion',
        Price: 500
    }
]
async function go(){
    await db.NewShopItems(Weapons);
    await db.NewShopItems(Potions);

    console.log('done');
}

go();