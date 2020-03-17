const go_read = async () => {
    var GCPSpanner = require('../game-core/utils/spanner.js');
    console.log(`===> reading...`);
    const spanner = new GCPSpanner('kalschi-agones', 'game-spanner', 'my-game-spanner',
        null, null);
    var result = await spanner.readPlayer('0000000e-6225-4381-8fea-3b2fcc367d68');
    console.log(result);

    result = await spanner.readPlayer(['0000000e-6225-4381-8fea-3b2fcc367d68', '00000013-0f3b-4686-ac32-48a99974965b']);
    console.log(result);
}

go_read();

