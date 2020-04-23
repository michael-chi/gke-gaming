const WebSocket = require('../game-core/node_modules/ws');
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

var standard_input = process.stdin;
standard_input.setEncoding('utf-8');

var host = process.env.HOST || "34.102.250.216";
//var host = "127.0.0.1:9999";
var current = '';
const reg = /HP:([\d]*)/g;


socket = new WebSocket("ws://" + host + "/ws");

function ramdomString(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

var myId = ramdomString(6);



function sleep(s) {
    return new Promise(resolve => setTimeout(resolve, s * 1000));
}
function send(cmd) {
    console.log(`>>>>>>>>>>>>> send:${cmd}`);
    socket.send(cmd);
}
function findVictim(players) {
    var index = Math.round(Math.random() * players.length);
    console.log(index);
    if (index < players.length && players[index] != myId) {
        var victim = players[index];
        console.log(`> victim:${victim}`);
        return victim;
    } else {
        return findVictim(players);
    }
}

async function eventHandler(event) {
    console.log(`==>> ${event.data}`);
    var match = reg.exec(event.data);
    if (match && match[1] == '0') {
        //send('quit');
        current = 'login';
        myId = ramdomString(6);
        send(`login ${myId}`);
        //await socket.close();
    }
    else if(event.data.includes('damage!')){
        // skip
    }
    else if (event.data.includes('W#@$F')) {
        //  end session
        send('quit');
        await socket.close();
    }
    else if (current == 'login') {
        send(`login ${myId}`);
        current = 'list';
    } else if (current == 'list') {
        if (event.data.includes('Yo!')) {
            //  skip welcome message
            send('list');
        } else {
            console.log(`>> ${event.data}`);
            var players = JSON.parse(event.data);
            console.log(`> players in the room:${event.data}`);
            current = 'attack';
            var index = Math.round(Math.random() * players.length);
            console.log(index);
            if (Math.random() >= 0.3) {
                var victim = findVictim(players);;
                console.log(`> victim:${victim}`);
                send(`attack ${victim}`);
                await sleep(Math.round(Math.random() * 5));

            } else {
                await sleep(Math.round(Math.random() * 5));
                if (Math.random() >= 0.5) {
                    send('look');
                } else {
                    send('stat');
                }
            }
        }
    } else if (current == 'attack') {
        await sleep(Math.random() * 5);
        current = 'list';

        socket.send('list');

    }
    console.log(event.data);
}
socket.onmessage = async function (event) {
    eventHandler(event);
};
socket.onerror = function (err) {
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
        current = 'login';
        socket.send('list');

        readline.on('line', function (line) {
            socket.send(line);
            if (line == 'quit') {
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
