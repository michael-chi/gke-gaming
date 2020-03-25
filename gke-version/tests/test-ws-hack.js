const WebSocket = require('../game-core/node_modules/ws');
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

var standard_input = process.stdin;
standard_input.setEncoding('utf-8');

var host = "34.102.250.216";
//var host = "127.0.0.1:9999";
//var host = "game.michaelchi.net";
function randomString(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
socket = new WebSocket("ws://" + host + "/ws");
socket.onmessage = function (event) {
    if (event)
        console.log(event.data);
};
socket.onerror = function (err) {
    console.log('err>>>');
    console.log(err);
    console.log(err.data);
    console.log(err.message);
    socket.close();
}
socket.onopen = function (event) {
    console.log(event.data);
    //  send 1 GB data to server...
    if (socket.readyState == WebSocket.OPEN) {
        socket.send(`login ${randomString(7)}`);
        
    } else {
        console.log('NOT Connected yet');
    }
};
socket.onmessage = function (event) {
    {
        const count = 100000000;
        for (var i = 0; i <= count; i++) {
            const garbage = 'look';//randomString(1000000000 * 0.01);
            console.log('sending...' + count);
            socket.send(garbage);
        }
    }
};
socket.onclose = function (event) {
    console.log(event.data);
};
