var UUIDv4 = require('../node_modules/uuidv4');
var PROFILE = require('../models/PlayerProfileV2');
var MATCH = require('../models/matchRecord');
var profile = new PROFILE(null, 'kalschi', 'kalschi@aol.com','Kals',10000,'+886928651701',new Date(1975,9,8), 'TEST','Male','sadads','KILLER',false,'',true,new Date(2019,12,31));

console.log(profile.toString());


var match = new MATCH('kalschi','tester',null,'test-room',12,Date.now());
console.log(match.toString());

console.log('======================================');
var o =  {
    PlayerId:'michael',
    TargetId:'tester',
}

var o = Object.assign(o, new PROFILE('123456','ttt'));
console.log(o);