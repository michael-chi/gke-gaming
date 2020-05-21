var User = require('../../models/user');
var GameConfiguration = require('../../models/config');
const log = require('../logger');
Array.prototype.toString = function () {
    const temp = [];
    this.forEach(item => temp.push(`'${item}'`));
    return temp.join();
}

function default_read_formatter(row) {
    const result = row.toJSON({ wrapNumbers: true });
    log('read user data from datasource',User,'MockCloudSpanner.js::default_read_formatter','info');
    return new User(result['name'], result['playerClass'], parseInt(result['hp'].value),
        parseInt(result['mp'].value),
        parseInt(result['playerLv'].value),
        null,
        result['id']);
}
function default_write_formatter(row) {

}


module.exports = class MockCloudSpanner {
    constructor(read_formatter, write_formatter) {
        try {
            const config = GameConfiguration.Spanner();
            this.read_formatter = read_formatter ? read_formatter : default_read_formatter;
            this.write_formatter = write_formatter ? write_formatter : default_write_formatter;
        } catch (err) {
            log('error constructing MockCloudSpanner',err,'MockCloudSpanner.js::constructor','error');
        }
    }

    async EnsurePlayer(name) {
        log('Ensure Player exists',name,'MockCloudSpanner.js::EnsurePlayer','info');
        return new User(name,'Warrior',120,120,1,null,name);
    }
    async readPlayer(name) {
        return EnsurePlayer(name);
    }

    updatePlayer(player) {
        
    }
    //  https://googleapis.dev/nodejs/spanner/latest/Database.html#getSessions
    //  It is unlikely we need to play around with sesisons, but here I want to explore how it works.
    async writePlayerWithMutationsAndSession(players) {
        return players;
    }
    async writePlayerWithMutations(players) {
        return players;
    }

    async newPlayer(player) {
        return player;
    }
}

