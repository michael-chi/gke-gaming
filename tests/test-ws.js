const WebSocket =require('../game-core/node_modules/ws');
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

var standard_input = process.stdin;
standard_input.setEncoding('utf-8');


socket = new WebSocket("ws://localhost:8080/ws");
socket.onmessage = function (event) {
    console.log(event.data);
};
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
