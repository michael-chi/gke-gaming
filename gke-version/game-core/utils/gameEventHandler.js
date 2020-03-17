var events = require('events');
const CloudSpanner = require('./spanner');

var Firebolt = require('../skills/firebolt');
var Smash = require('../skills/smash');
// console.log('asdasdsadsadddddd')
// console.log(new CloudSpanner('','','',null,null));
function createSpanner(){
    return CreateSpannerClient();
}

console.log(CloudSpanner.EnsurePlayer);
module.exports = class GameEventHandler {
    configure(player, eventHandler) {
        player.skills( [new Firebolt('firebolt'), new Smash('smash')]);
        player.on('*', async function (data){ await eventHandler({event:'*', actor:player});});
        player.on('hp', async function (data){ await eventHandler({event:'hp', actor:player});});
        player.on('mp', async function (data){ await eventHandler({event:'mp', actor:player});});
        player.on('playerLv', async function (data){ await eventHandler({event:'playerLv', actor:player});});
    }
    async setup (player, eventHandler){
        console.log(`setting up player event handlers for ${player.name}...`);
        player.on('*', async function(data) {
            console.log(`event fired for player ${data.actor}`);
        });
        player.on('hp', async function(data) {
            console.log(`hp event fired for player ${data.actor}`);
            var spanner = createSpanner();
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
};
