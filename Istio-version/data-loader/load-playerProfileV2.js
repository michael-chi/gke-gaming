var random_name = require('../database-api/node_modules/node-random-name');
const { uuid } = require('../database-api/node_modules/uuidv4');
const Profile = require('../database-api/models/PlayerProfileV2');
const Spanner = require('../database-api/utils/spanner');
const Firestore = require('../database-api/utils/firestore_datastore');
require('../database-api/node_modules/dotenv').config();

var firestore = new Firestore(process.env.PROJECT_ID);
const DBAccess = require('../database-api/utils/DataAccess');
const db = new DBAccess();


const Classes = ['Warrior', 'Mage', 'Knight', 'Hunter'];
const MaxHP = [210, 150, 220, 180];
const MaxMP = [0, 300, 100, 0];
const EMAILS = ['@gmail.com', '@yahoo.com', '@msn.com', '@outlook.com', '@aol.com'];
const time_begin = new Date(2018, 1, 1, 01, 01, 0);
const time_end = new Date(2020, 5, 1, 23, 59, 59);
const bd_start = new Date(1970, 1, 1);
const bd_end = new Date(2002, 11, 31);

function randomDate(start, end) {
    var date = new Date(+start + Math.random() * (end - start));
    var hour = 0;
    date.setHours(hour);
    return date;
}
function randomPhone() {
    var result = '';
    length = 8;
    var characters = '01234567890';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return '09' + result;
}
function randomArbitrary(min, max) {
    return Math.round(Math.random() * (max - min)) + min;
}

function randomString(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
const Type1 = ['Killer', 'Looker', 'Idle'];
const Type2 = ['FrequentUser', 'CloudUser'];
const Type3 = ['Buyer', 'SuperBuyer', 'NoBuy', 'PromotionOnly', 'PromotionOnly', 'PromotionOnly', 'NoBuy', 'NoBuy', 'NoBuy', 'NoBuy', 'NoBuy', 'NoBuy', 'NoBuy', 'NoBuy', 'NoBuy', 'NoBuy', 'NoBuy', 'NoBuy'];
const Type4 = ['BuyWeapon', 'BuyPotion'];
const Avator = require('../database-api/models/user');

function sleep(s) {
    return new Promise(resolve => setTimeout(resolve, s * 1000));
}
async function go() {
    try {
        var ids = '';
        for (var j = 0; j < 100000; j++) {
            var users = [];
            var avatars = [];
            for (var i = 0; i < 500; i++) {
                var tags = [Type1[randomArbitrary(0, Type1.length)], Type2[randomArbitrary(0, Type2.length)],
                            Type3[randomArbitrary(0, Type3.length)], Type4[randomArbitrary(0, Type4.length)]].join(',');
                var balance = tags.indexOf('SuperBuyer') >= 0 ? randomArbitrary(5, 10) * 1000 :
                            (tags.indexOf('Buyer') >= 0 ? randomArbitrary(2, 4) * 1000 : 0);
                const id = random_name().replace(' ', '_').substring(0, 35) + '-' + randomString(10);
                if (ids.indexOf(id) >= 0)
                    continue;
                ids += id + ';';
                var regDay = randomDate(time_begin, time_end);
                var bday = randomDate(bd_start, bd_end);

                var user = new Profile(uuid(),
                    id,
                    id + EMAILS[randomArbitrary(0, 4)],
                    id,
                    balance,
                    randomPhone(),
                    bday,
                    'XXX',
                    randomArbitrary(0, 100) > 50 ? 'M' : 'F',
                    'XXX',
                    tags,
                    false,
                    '',
                    false,
                    regDay);
                users.push(user);

                var playerClass = randomArbitrary(0, 3);
                console.log(`playerClass=${playerClass}`);
                
                var avator = new Avator(user.PlayerId, 
                    user.Nickname,
                    Classes[playerClass],
                    MaxHP[playerClass],
                    MaxMP[playerClass],
                    10,
                    null,
                    user.UUID,
                    Date.now(),
                    null);
                avator.tags = tags.split(',');
                avator.isOnline = false;
                avator.createTime = Date.now();
                console.log(`${JSON.stringify(avator.toJson())}`);
                avatars.push(avator.toJson());
            }
            console.log('done. adding to Spanner:' + users.length);

            db.NewPlayerProfile(users);
            db.UpdatePlayer(avatars);
            await sleep(1);

        }
    } catch (ex) {
        console.log(ex);
        throw ex;
    }
}
try{
    go();
}catch(e){
    console.log(e);
    throw e;
}