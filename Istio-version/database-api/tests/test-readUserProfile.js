var random_name = require('node-random-name');
const { uuid } = require('uuidv4');
require('dotenv').config();

const Profile = require('../models/PlayerProfileV2');
var random_name = require('node-random-name');

const Classes = ['Warrior', 'Mage', 'Knight', 'Hunter'];
const MaxHP = [210, 150, 220, 180];
const MaxMP = [0, 300, 100, 0];
const EMAILS = ['@gmail.com', '@yahoo.com', '@msn.com', '@outlook.com', '@aol.com'];

const time_begin = new Date(2018, 1, 1, 01, 01, 0).getTime();
const time_end = new Date(2020, 5, 1, 23, 59, 59).getTime();


const Spanner = require('../utils/spanner');


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
async function go() {
    const spanner = new Spanner();

    try{
        var s = Date.now();
        var u = await spanner.readUserProfiles('Aurelio_Barry-iQQItt8ZPl');
        var e = Date.now();

        console.log(u);
        console.log(e-s);
    }catch(e){
        console.log('==============');
        console.log(e);
    }
}

go();