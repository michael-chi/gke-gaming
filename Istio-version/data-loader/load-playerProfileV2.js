var random_name = require('node-random-name');
const { uuid } = require('uuidv4');
require('dotenv').config();

const Profile = require('../database-api/models/PlayerProfileV2');
var random_name = require('node-random-name');

const Classes = ['Warrior', 'Mage', 'Knight', 'Hunter'];
const MaxHP = [210, 150, 220, 180];
const MaxMP = [0, 300, 100, 0];
const EMAILS = ['@gmail.com','@yahoo.com','@msn.com','@outlook.com','@aol.com'];
const time_begin = new Date(2018, 1, 1, 01, 01, 0).getTime();
const time_end = new Date(2020, 5, 1, 23, 59, 59).getTime();
const Spanner = require('../database-api/utils/spanner');

const bd_start = new Date(1970, 1, 1);
const bd_end = new Date(2002, 12, 31);
const Type1 = ['Killer'];
const Type2 = ['FrequentUser','CloudUser'];
const Type3 = ['Buyer','SuperBuyer','NoBuy'];
const Type4 = ['BuyWeapon', 'BuyPotion'];

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

/*
CREATE TABLE UserProfile (
    UUID STRING(36) NOT NULL,           -- UUID for this player, random, for distribution
    PlayerId STRING(36) NOT NULL,       -- Player readable Id, such as michael-chi
    Email STRING(64) NOT NULL,
    Nickname STRING(64) NOT NULL,
    Balance INT64 NULL,
    MobilePhoneNumber STRING(10) NOT NULL,
    BirthDay TIMESTAMP NOT NULL,
    HomeAddress STRING(64) NOT NULL,
    Gender STRING(1) NOT NULL,
    PasswordHash STRING(64) NOt NULL,
    Tag STRING(64) NULL,
    IsDisable BOOL NULL,
    DisableReason STRING(24) NULL,
    IsPromoted BOOL NULL,
    CreateTime TIMESTAMP NOT NULL,
) PRIMARY KEY (UUID);
*/

async function go(){
    var users = [];
    var ids = '';
    var i = 0;
    while(i < 1500){
        const id = random_name().replace(' ', '_').substring(0,35);
        if(ids.indexOf(id) >= 0)
            continue;
        ids += id + ';';
        i++;
        var user = new Profile(uuid(),
                            id,
                            id + EMAILS[randomArbitrary(0,4)],
                            random_name(),
                            0,
                            randomPhone(),
                            new Date(randomArbitrary(bd_start, bd_end)),
                            'XXX',
                            randomArbitrary(0,100) > 50 ? 'Male' : 'Female',
                            'XXX',
                            [],
                            false,
                            '',
                            false,
                            new Date(randomArbitrary(time_begin, time_end)));
        users.push(user);
        console.log(`creating ${i}...`);
        //await sleep(1);
    }
    console.log('done. adding to Spanner');
    const spanner = new Spanner();
    await spanner.newUserProfiles(users);
}

go();