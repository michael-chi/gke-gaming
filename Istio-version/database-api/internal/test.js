const Spanner = require('../utils/spannerV2');
const Firestore = require('../utils/firestore_datastore');
const {BigQuery} = require('@google-cloud/bigquery');

module.exports = class TesterApi{
    async getRandomPlayer(tag) {
        const query = `select playerId, tags from \`kalschi-istio.game_players.players\` where RAND() < 1/164656 and "${tag}" in UNNEST(tags) limit 1`;
        const bigquery = new BigQuery();
        const options = {
            query: query,
            location: 'asia-northeast1',
        };
        const [rows] = await bigquery.query(options);
        return rows[0];
    }

    async deposit(playerId) {
        const query = `select playerId, tags from \`kalschi-istio.game_players.players\` where RAND() < 1/164656 and "${tag}" in UNNEST(tags) limit 1`;
        const bigquery = new BigQuery();
        const options = {
            query: query,
            location: 'asia-northeast1',
        };
        const [rows] = await bigquery.query(options);
        return rows[0];
    }
}