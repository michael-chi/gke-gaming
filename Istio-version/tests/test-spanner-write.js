const User = require('../game-core/models/user');

function randomString(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }

const go_write = async () => {
    var GCPSpanner = require('../game-core/utils/spanner.js');
    const spanner = new GCPSpanner('kalschi-agones', 'game-spanner', 'mud-sample',
        null, null);
    console.log(`===> writing...`);
    const user = new User('michi-' + randomString(5), 'Warrior', 100, 100, 12, null);
    var result = await spanner.newPlayer(
        user
    );
    
    return user;
}
const go_read = async (name) => {
    console.log(`retrieving ${name}`);

    var GCPSpanner = require('../game-core/utils/spanner.js');
    const spanner = new GCPSpanner('kalschi-agones', 'game-spanner', 'mud-sample',
        null, null);
    var result = await spanner.readPlayer(name);  
    console.log('retriving done');
    return result;
}
const go_update = async (user) => {
    var GCPSpanner = require('../game-core/utils/spanner.js');
    const spanner = new GCPSpanner('kalschi-agones', 'game-spanner', 'mud-sample',
        null, null);
    console.log(`===> go_update...`);
    var result = await spanner.updatePlayer(
        user
    );

    console.log(result);
}

const go = async() =>{
    var user = await go_write();
    console.log(`new player created:\r\n${(await user).toString()}`);
    user.hp = 1000;
    console.log(`updating User:\r\n${user.toString()}`);
    await go_update(user);
    const updatedUser = await go_read(user.name);
    console.log(`retrieved:\r\n${updatedUser.toString()}`);
}
go();

