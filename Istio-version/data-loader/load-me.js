var random_name = require('node-random-name');
const Spanner = require('../utils/spanner');
const Firestore = require('../utils/firestore_datastore');
function randomString(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function randomArbitrary(min, max) {
    return Math.round(Math.random() * (max - min)) + min;
}

function sleep(s) {
    return new Promise(resolve => setTimeout(resolve, s * 1000));
}

require('dotenv').config();

const User = require('../models/user');

const Classes = ['Warrior', 'Mage', 'Knight', 'Hunter'];
const MaxHP = [210, 150, 220, 180];
const MaxMP = [0, 300, 100, 0];

async function go(){
    var spanner = new Spanner();
    var firestore = new Firestore();

    var playerClass = 2;
    console.log(`playerClass=${playerClass}`);
    var user = new User('Michael Chi',
                    Classes[playerClass],
                    MaxHP[playerClass],
                    MaxMP[playerClass],
                    10,
                    null,
                    'kalschi'
                );
    console.log(user);
    await firestore.upsertPlayer(user.toJson());
}

go();