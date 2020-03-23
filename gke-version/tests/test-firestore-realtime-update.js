const admin = require('../game-core/node_modules/firebase-admin');
const functions = require('../game-core/node_modules/firebase-functions');
const { uuid } = require('../game-core/node_modules/uuidv4');

admin.initializeApp({
    credential: admin.credential.applicationDefault()
});

db = admin.firestore();
let doc = db.collection('PlayerState').doc('test');

doc.onSnapshot(docSnapshot => {
    console.log(`Received doc snapshot: ${JSON.stringify(docSnapshot)}`);
    console.log(`Received doc snapshot: ${JSON.stringify(docSnapshot._fieldsProto)}`);
}, err => {
    console.log(`Encountered error: ${err}`);
});
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});
var standard_input = process.stdin;
standard_input.setEncoding('utf-8');
readline.on('line', function (line) {
    if (line == 'quit') {
        readline.close();
    }
});