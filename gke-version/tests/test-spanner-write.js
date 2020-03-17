const User = require('../game-core/models/user');

const go_write = async () => {
    var GCPSpanner = require('../game-core/utils/spanner.js');
    const spanner = new GCPSpanner('kalschi-agones', 'game-spanner', 'mud-sample',
        null, null);
    console.log(`===> writing...`);
    var result = await spanner.newPlayer(
        new User('michi-100', 'Warrior', 100, 100, 12, null)
    );

    console.log(result);
}

go_write();

