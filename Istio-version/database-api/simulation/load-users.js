var random_name = require('node-random-name');
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
    return Math.random() * (max - min) + min;
}

function sleep(s) {
    return new Promise(resolve => setTimeout(resolve, s * 1000));
}



const User = require('../models/user');
const Classes = ['Warrior', 'Mage', 'Knight', 'Hunter'];
const MaxHP = [210, 150, 220, 180];
const MaxMP = [0, 300, 100, 0];

async function go(){
    for(var i = 0; i < 30000; i ++){
        var playerClass = randomArbitrary(0,3);
        var user = new User(random_name(),
                        Classes[playerClass],
                        MaxHP[playerClass],
                        MaxMP[playerClass],
                        10,
                        null,
                        randomString(randomArbitrary(5, 10))
                    );
        
        await sleep(100);
    }

}

go();