const { BigQuery } = require('@google-cloud/bigquery');

async function getRandomPlayer(tag) {
    const query = `select playerId,tags from \`kalschi-istio.game_players.players\` where RAND() < 1/164656 and "${tag}" in UNNEST(tags) limit 1`;
    const bigquery = new BigQuery();
    const options = {
        query: query,
        location: 'asia-northeast1',
    };

    // Run the query as a job
    const [rows] = await bigquery.query(options);
    return rows[0];
}
var result = getRandomPlayer('Killer','createTime >= 1589375243993');
Promise.resolve(result).then(r => console.log(r));