var events = require('events');
const CloudSpanner = require('./spanner');

var Firebolt = require('../skills/firebolt');
var Smash = require('../skills/smash');

console.log(CloudSpanner.EnsurePlayer);
module.exports = class GameEventHandler {
    configure(player, eventHandler) {
        player.skills( [new Firebolt('firebolt'), new Smash('smash')]);
        player.on('*', async function (data){ await eventHandler({event:'*', actor:player});});
        player.on('hp', async function (data){ await eventHandler({event:'hp', actor:player});});
        player.on('mp', async function (data){ await eventHandler({event:'mp', actor:player});});
        player.on('playerLv', async function (data){ await eventHandler({event:'playerLv', actor:player});});
        player.on('login', async function (data){ await eventHandler({event:'playerLv', actor:player});});
        player.on('quit', async function (data){ await eventHandler({event:'playerLv', actor:player});});
    }
};
