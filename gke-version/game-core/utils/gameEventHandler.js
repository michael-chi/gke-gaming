var events = require('events');
const Spanner = require('./spanner.js');
const NewSpannerClient = require('./spanner.js').CreateSpannerClient;

const Firebolt = require('../skills/firebolt.js');
const Smash = require('../skills/smash.js');

console.log(Spanner);

class GameEventHandler {
    
    constructor(){}

    setup (player){
        console.log(`setting up player event handlers for ${player.name}...`);
        player.skills( [new Firebolt('firebolt'), new Smash('smash')]);
        player.on('*', async function(data) {
            console.log(`event fired for player ${data.actor}`);
        });
        player.on('hp', async function(data) {
            console.log(`hp event fired for player ${data.actor}`);
            var spanner = NewSpannerClient();
            await spanner.updatePlayer(player);
        });
        player.on('mp', async function(data) {
            console.log(`mp event fired for player ${data.actor}`);
            var spanner = NewSpannerClient();
            await spanner.updatePlayer(player);
        });
        player.on('playerLv', async function(data) {
            console.log(`playerLv event fired for player ${data.actor}`);
            var spanner = NewSpannerClient();
            await spanner.updatePlayer(player);
        });
    }
}

module.exports = GameEventHandler;