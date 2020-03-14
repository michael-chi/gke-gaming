const WebSocket =require('../game-core/node_modules/ws');
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

var standard_input = process.stdin;
standard_input.setEncoding('utf-8');

//34.102.250.216:80
//var host = "10.4.13.12";
//var host = "127.0.0.1:8080";
var host = "game.michaelchi.net:80";

socket = new WebSocket("ws://" + host + "/");
socket.onmessage = function (event) {
    console.log(event.data);
};
socket.onerror = function(err){
    console.log('err');
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
