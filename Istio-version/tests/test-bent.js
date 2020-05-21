const bent = require('../game-core/node_modules/bent')
async function post(uri, data) {
    const post = bent(uri, 'PATCH', {'CONTENT-TYPE': 'application/json'}, 200);
    var resp = await post('/post',data);

    return resp;
}

async function go() {
    try {
        var resp = await post('https://postman-echo.com', JSON.stringify({ data: 'test' }));
        console.log((await resp.json()).data);
    } catch (e) {
        console.log(e);
    }
}

go();