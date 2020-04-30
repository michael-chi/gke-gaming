"use strict";
require('dotenv').config();
const log = require('./utils/logger');
const serverPort = 9999,
    express = require("express"),
    app = express();


app.get('/', function (req, res) {
    log('get /');
    res.send('ok');
});
app.post('/', function(req,res){
    log('post /');
    res.send('ok');
});

app.listen(serverPort, function () {
    log(`Example app listening on port ${serverPort}`);
});