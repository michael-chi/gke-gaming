const log = require('../logger');

class MockGameWorldRealtimeStatStorage {
    constructor(projectId) {
    }
    //log('error constructing MockCloudSpanner',err,'MockCloudSpanner.js::constructor','error');
    updateGameWorldStastics(players) {
        log('updating game world stastics data', players, 'MockGameWorldRealtimeStatStorage:updateGameWorldStastics', 'info');
        
    }
    updatePlayerState(player) {
        log('updating player data', player, 'MockGameWorldRealtimeStatStorage:updatePlayerState', 'info');
          
    }
    updateWorldwideMessages(issuer, target, message) {
        log('updating game world message', {issuer:issuer, target:target, message:message}, 'MockGameWorldRealtimeStatStorage:updateWorldwideMessages', 'info');
           
    }
}

module.exports = MockGameWorldRealtimeStatStorage;