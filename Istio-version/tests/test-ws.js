const WebSocket =require('../game-core/node_modules/ws');
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

var standard_input = process.stdin;
standard_input.setEncoding('utf-8');

var host = "ws://34.80.239.146/";
//var host = "ws://127.0.0.1:11112/";
//var host = "127.0.0.1:9999";
//var host = "game.michaelchi.net";

socket = new WebSocket(host);
socket.onmessage = function (event) {
    if(event)
        console.log(event.data);
};
socket.onerror = function(err){
    console.log('err>>>');
    console.log(err);
    console.log(err.data);
    console.log(err.message);
    socket.close();
}
socket.onopen = function (event) {
    console.log(event.data);
    if (socket.readyState == WebSocket.OPEN) {
        readline.setPrompt('Game>>');
        readline.prompt();
        readline.on('line', function(line){
            socket.send(line);
            if(line == 'quit'){
                readline.close();
            }
        });
    } else {
        console.log('NOT Connected yet');
    }
};
socket.onclose = function (event) {
    console.log(event.data);
};
