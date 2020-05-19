const { Spanner } = require('@google-cloud/spanner');
var PlayerProfile = require('../models/PlayerProfile');
var GameConfiguration = require('../models/config');
const MatchRecord = require('../models/matchRecord');
const { uuid } = require('uuidv4');
const log = require('./logger');
const random = require('./random');
//== reuse spanner instance ?
const config = GameConfiguration.DataAccess();
var spanner = new Spanner({
    projectId: config.PROJECT_ID,
});
var instance = spanner.instance(config.INSTANCE_ID);

Array.prototype.toString = function () {
    const temp = [];
    this.forEach(item => temp.push(`'${item}'`));
    return temp.join();
}
Array.prototype.toRecords = function (callback) {
    return callback(this);
}
function default_read_formatter(row) {
    const result = row.toJSON({ wrapNumbers: true });

    var user = new User(result['name'], result['playerClass'], parseInt(result['hp'].value),
        parseInt(result['mp'].value),
        parseInt(result['playerLv'].value),
        null,
        result['id']);
    log('read user data from datasource', user, 'CloudSpanner.js::default_read_formatter', 'info');
    return user;
}
function default_write_formatter(row) {

}

module.exports = class CloudSpanner {
    constructor() {
    }
    getSpannerDatabase() {
        try {
            var database = instance.database(config.DATABASE_ID);
            return database;
        } catch (e) {
            log('error constructing CloudSpanner', { error: e }, 'CloudSpanner.js::initSpanner', 'error');
            throw e;
        }
    }
    async _runTransactionsEx(options, callback) {
        return new Promise((res, rej) => {
            var database = null;
            try {
                database = this.getSpannerDatabase();
                database.runTransaction(async (err, transaction) => {
                    var s = Date.now();
                    var result = null;
                    if (err) {
                        console.log(err);
                        log('error _runTransactions', { error: err, match: records }, 'CloudSpanner.js:_runTransactions', 'error');
                        return rej(err);
                    }
                    try {
                        result = callback(options, transaction);
                        //await transaction.commit();
                        var e = Date.now();
                        log('spanner server duration', { duration: (e - s), result: result }, '_runTransactions', 'debug');
                    } catch (ex) {
                        log('_runTransactions exception (inner)', { error: ex, options: options }, 'CloudSpanner.js:_runTransactions:runTransaction', 'error');
                        throw ex;
                    } finally {
                        //database.close();    //TODO: should close ?
                        return res(result);
                    }
                });
            } catch (e) {
                log('_runTransactions exception (outter)', { error: e, records: records }, 'CloudSpanner.js:_runTransactions', 'error');
                return rej(e);
            }
        });
    }

    async _runMutation(records, callback) {
        var target = [];
        if (records instanceof Array) {
            target = records;
        } else {
            target.push(records);
        }
        var database = null;
        try {
            database = this.getSpannerDatabase();
            database.runTransaction(async (err, transaction) => {
                var s = Date.now();
                if (err) {
                    console.log(err);
                    log('error _runMutation', { error: err, match: records }, 'CloudSpanner.js:_runMutation', 'error');
                    return;
                }
                try {
                    target.forEach(item => {
                        callback(item, transaction);
                    }
                    );
                    await transaction.commit();
                    var e = Date.now();
                    log('spanner server duration', { duration: (e - s) }, '_runMutation', 'debug');
                } catch (ex) {
                    log('_runMutation exception (inner)', { error: ex }, 'CloudSpanner.js:_runMutation:runTransaction', 'error');
                    throw ex;
                } finally {
                    //database.close();    //TODO: should close ?
                }
            });
        } catch (e) {
            log('_runMutation exception (outter)', { error: e }, 'CloudSpanner.js:_runMutation', 'error');
            throw e;
        }
    }
    async _querySpanner(query, callback) {
        try {
            var s = Date.now();

            var database = this.getSpannerDatabase();
            const [rows] = await database.run(query);

            var e = Date.now();
            log(`spanner server duration`, { rows: rows, duration: (e - s) }, '_querySpanner', 'info');
            var results = [];
            rows.forEach(
                row => callback(row, results)
            );
            if (results.length == 1) {
                return results[0];
            } else if (results.length > 0) {
                return results;
            } else return null;
        } catch (err) {
            log(`error _querySpanner`, { error: err, query: query }, "spanner.js:_querySpanner", "info");
            throw err;
        } finally {
            //await database.close();   //TODO: should close ?
        }
    }

    async readUserProfiles(playerId) {
        var query = null;
        if (playerId)
            query = {
                sql: `SELECT UUID, PlayerId,Email, Nickname, Balance, IsDisable, IsPromoted, Tag, DisableReason FROM UserProfile@{force_index=IX_PlayerProfileInGame_By_PlayerId} where PlayerId='${playerId}'`,
            };
        else
            query = {
                sql: `SELECT UUID, PlayerId,Email, Nickname, Balance, IsDisable, IsPromoted, Tag, DisableReason FROM UserProfile@{force_index=IX_PlayerProfileInGame_By_PlayerId}'`,
            };

        try {
            var results = await this._querySpanner(query, (row, items) => {
                const json = row.toJSON();
                items.push(json);
                //items.push(new PlayerProfileV2(json.PlayerId, json.Email, json.Nickname, json.LastLoginTime, json.IsOnLine, json.ShardId).toJson());
            });
            log('readUserProfile results', { results: results }, 'readUserProfile', 'debug');
            return results;
        } catch (err) {
            log(`unable to read user profile`, { error: err, playerId: playerId }, "spanner.js:readUserProfiles", "info");
            throw err;
        }
    }
    async listShopItems() {
        var query = null;
        query = {
            sql: `SELECT ItemID, ItemName, ItemDesc, ItemType, Price, IsEnabled, IsPromotion FROM ShopInventory@{force_index=IX_ShopInventory_By_IsEnabledAndPromotion} where IsEnabled=true`,
        };

        var results = await this._querySpanner(query, (row, items) => {
            const json = row.toJSON();
            items.push(json);
        });
        console.log(`========>${results}`);
        return results;

    }
    async readMatch(id) {
        var query = null;
        if (id)
            query = {
                sql: `SELECT MatchId, PlayerId, TargetId, MatchTime,Damage,RoomId FROM PlayerMatchHistory@{force_index=IX_PlayerMatchHistory_By_PlayerId_MatchTime_DESC} where MatchId='${id}'`,
            };
        else
            query = {
                sql: `SELECT MatchId, PlayerId, TargetId, MatchTime,Damage,RoomId FROM PlayerMatchHistory@{force_index=IX_PlayerMatchHistory_By_MatchTime_DESC}`,
            };
        var results = await this._querySpanner(query, (row, items) => {
            const json = row.toJSON();
            items.push(new MatchRecord(json.PlayerId, json.TargetId, json.MatchId, json.RoomId, json.DAMAGE, json.MatchTime).toJson());
        });
        console.log(`========>${results}`);
        return results;

    }
    async newShopItems(items) {
        var target = [];
        if (items instanceof Array) {
            items.forEach(item => {
                if (!item.CreateTime) {
                    item.CreateTime = Spanner.timestamp(Date.now());
                }
                if (!item.ItemID) {
                    item.ItemID = uuid();
                }
                target.push(item);
            })
        } else {
            items.CreateTime = Spanner.timestamp(Date.now());
            if (!items.ItemID) {
                items.ItemID = uuid();
            }
            target.push(items);
        }
        try {
            await this._runMutation(target,
                async (item, tx) => {
                    await tx.insert('ShopInventory', item);
                });
            return target;
        } catch (e) {
            console.log(e);
            throw e;
        } finally {
        }
    }
    async deposit(playerId, amount) {
        return await this._runTransactionsEx(
            {
                playerId: playerId,
                amount: amount
            },
            async (options, tx) => {
            try {
                const [upResults] = await tx.runUpdate({
                    sql: 'update UserProfile set Balance = Balance + @amount where PlayerId=@playerId',
                    params: {
                        playerId: playerId,
                        amount: amount
                    }
                });
                tx.commit();
                return upResults;
            } catch (ex) {
                throw ex;
            }
        });
    }
    //  TODO:
    async BuyShopItem(playerUUID, itemID, quantity) {
        //  1. Check user balance
        //  2. Calculate new balance and update UserProfile
        //  3. update Inventory table
        //  4. update transaction-histor table
        //return await this._exec('BuyShopItem', async () => 
        {
            return await this._runTransactionsEx(
                {
                    playerUUID: playerUUID,
                    itemID: itemID,
                    quantity: quantity
                },
                async (options, tx) => {
                    const [upResults] = await tx.run({
                        sql: 'SELECT UUID, PlayerId, Balance FROM UserProfile where UUID=@uuid',
                        params: {
                            uuid: playerUUID
                        }
                    });
                    const [siResults] = await tx.run({
                        sql: 'SELECT Price, ItemName FROM ShopInventory where ItemID=@itemId',
                        params: {
                            itemId: itemID
                        }
                    });

                    console.log(`upResults=${JSON.stringify(upResults)}`);
                    const user = upResults[0].toJSON();
                    if (siResults.length == 0) {
                        tx.end();
                        return false;
                    }
                    const item = siResults[0].toJSON();
                    var playerId = user.PlayerId;
                    var balance = user.Balance;
                    var cost = parseInt(item.Price) * quantity;

                    if (balance >= cost) {
                        var newBalance = balance - cost;

                        const [uiResults] = await tx.run({
                            sql: 'SELECT u.UUID, u.PlayerId, u.Balance, s.ItemID, s.Quantity FROM UserProfile u join UserInventory s on u.UUID = s.UUID where u.UUID=@uuid',
                            params: {
                                uuid: playerUUID
                            }
                        });
                        console.log(`============ ${JSON.stringify(uiResults[0])} ==========`);
                        if (uiResults && uiResults.length > 0) {
                            console.log('============ EXISTING PURCHASE ==========');
                            var newRecord = {
                                UUID: playerUUID,
                                ItemID: itemID,
                                ItemName: item.ItemName,
                                PurchaseDate: Spanner.timestamp(Date.now()),
                                PurchasePrice: parseInt(item.Price),
                                Quantity: quantity + uiResults[0].toJSON().Quantity
                            };
                            console.log(JSON.stringify(newRecord));
                            tx.upsert('UserInventory', newRecord);
                        } else {
                            console.log('============ NEW PURCHASE ==========');
                            tx.upsert('UserInventory', {
                                UUID: playerUUID,
                                ItemID: itemID,
                                ItemName: item.ItemName,
                                PurchaseDate: Spanner.timestamp(Date.now()),
                                PurchasePrice: parseInt(item.Price),
                                Quantity: quantity
                            });
                        }
                        tx.insert('TransactionHistory', {
                            PlayerId: playerId,
                            UUID: uuid(),
                            PurchasedItemID: itemID,
                            PurchasedQuantity: quantity,
                            StoreChannelID: 'Online',
                            TransactionTime: Spanner.timestamp(Date.now())
                        });
                        tx.update('UserProfile', {
                            UUID: playerUUID,
                            Balance: newBalance
                        });
                        tx.commit();
                        return true;
                    } else {
                        tx.end();
                        return false;
                    }
                }
            );
        }
    }
    //  TODO:
    async BuyShopItem_V1(playerUUID, itemID, quantity) {
        //  1. Check user balance
        //  2. Calculate new balance and update UserProfile
        //  3. update Inventory table
        //  4. update transaction-histor table
        //return await this._exec('BuyShopItem', async () => 
        {
            return await this._runTransactionsEx(
                {
                    playerUUID: playerUUID,
                    itemID: itemID,
                    quantity: quantity
                },
                async (options, tx) => {
                    const [upResults] = await tx.read('UserProfile', {
                        columns: ['UUID', 'Balance', 'PlayerId'],
                        keys: [playerUUID]
                    });
                    const [siResults] = await tx.read('ShopInventory', {
                        columns: ['Price', 'ItemName'],
                        keys: [itemID]
                    });
                    console.log(`upResults=${JSON.stringify(upResults)}`);
                    const user = upResults[0].toJSON();
                    if (siResults.length == 0) {
                        tx.end();
                        return false;
                    }
                    const item = siResults[0].toJSON();
                    var playerId = user.PlayerId;
                    var balance = user.Balance;
                    var cost = parseInt(item.Price) * quantity;

                    if (balance >= cost) {
                        var newBalance = balance - cost;
                        const opt = {
                            keys: [
                                ['UUID', playerUUID],
                                ['ItemID', itemID]
                            ],
                            columns: ['Quantity']
                        };
                        //const [uiResults] = await tx.read('UserInventory', opt);
                        const [uiResults] = await tx.run({
                            sql: 'SELECT u.UUID, u.PlayerId, u.Balance, s.ItemID, s.Quantity FROM UserProfile u join UserInventory s on u.UUID = s.UUID where u.UUID=@uuid',
                            params: {
                                uuid: playerUUID
                            }
                        });
                        console.log(`============ ${JSON.stringify(uiResults[0])} ==========`);
                        if (uiResults && uiResults.length > 0) {
                            console.log('============ EXISTING PURCHASE ==========');
                            var newRecord = {
                                UUID: playerUUID,
                                ItemID: itemID,
                                ItemName: item.ItemName,
                                PurchaseDate: Spanner.timestamp(Date.now()),
                                PurchasePrice: parseInt(item.Price),
                                Quantity: quantity + uiResults[0].toJSON().Quantity
                            };
                            console.log(JSON.stringify(newRecord));
                            tx.upsert('UserInventory', newRecord);
                        } else {
                            console.log('============ NEW PURCHASE ==========');
                            tx.upsert('UserInventory', {
                                UUID: playerUUID,
                                ItemID: itemID,
                                ItemName: item.ItemName,
                                PurchaseDate: Spanner.timestamp(Date.now()),
                                PurchasePrice: parseInt(item.Price),
                                Quantity: quantity
                            });
                        }
                        tx.insert('TransactionHistory', {
                            PlayerId: playerId,
                            UUID: uuid(),
                            PurchasedItemID: itemID,
                            PurchasedQuantity: quantity,
                            StoreChannelID: 'Online',
                            TransactionTime: Spanner.timestamp(Date.now())
                        });
                        tx.update('UserProfile', {
                            UUID: playerUUID,
                            Balance: newBalance
                        });
                        tx.commit();
                        return true;
                    } else {
                        tx.end();
                        return false;
                    }
                }
            );
        }
    }
    async newMatch(records) {
        var target = [];
        if (records instanceof Array) {
            records.forEach(match => {
                if (!match.MatchTime) {
                    match.MatchTime = Spanner.timestamp(Date.now());
                }
                if (!match.MatchId) {
                    match.MatchId = uuid();
                }
                target.push(match);
            })
        } else {
            records.MatchTime = Spanner.timestamp(Date.now());
            if (!records.MatchId) {
                records.MatchId = uuid();
            }
            target.push(records);
        }
        try {
            await this._runMutation(target,
                async (match, tx) => {
                    await tx.insert('PlayerMatchHistory', match);
                });
            return target;
        } catch (e) {
            console.log(e);
            throw e;
        } finally {
        }
    }

    async newUserProfiles(players) {
        var target = [];
        if (players instanceof Array) {
            players.forEach(
                player => {
                    if (!player.UUID) {
                        player.UUID = uuid();
                    }
                    if (!player.CreateTime) {
                        player.CreateTime = Spanner.timestamp(Date.now());
                    }
                    target.push(player)
                }
            )
        } else {
            if (!players.UUID) {
                players.UUID = uuid();
            }
            if (!players.CreateTime) {
                players.CreateTime = Spanner.timestamp(Date.now());
            }
            target.push(players);
        }
        try {
            await this._runMutation(target,
                async (item, tx) => {
                    await tx.insert('UserProfile', item);
                });
            return target;
        } catch (e) {
            console.log('==========================================');
            console.log(e);

            throw e;
        }
    }

    async updateUserProfiles(profile) {
        var target = [];
        if (profile instanceof Array) {
            profile.forEach(
                player => {
                    target.push(player.toJson()
                    )
                }
            )
        } else {
            target.push(profile.toJson());
        }
        try {
            await this._runMutation(target,
                async (match, tx) => {
                    await tx.update('UserProfile', match);
                });
            return profile;

        } catch (e) {
            console.log('==========================================');
            console.log(e);
        }
        return profile;
    }
    //====================

}

