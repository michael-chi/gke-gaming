module.exports = class DataStoreFactory {
    constructor() {
        this._local_mode = process.env.LOCAL_MODE ? process.env.LOCAL_MODE : false;
    }
    getFirestore() {
        console.log(`local mode is ${this._local_mode}`);
        if (this._local_mode) {
            console.log('mocking firestore');
            const mock = require('./mock/firestore_native');
            return new mock();
        } else {
            const admin = require('firebase-admin');
            const functions = require('firebase-functions');
            return admin.firestore();
        }
    }
    getSpanner() {
        console.log(`local mode is ${this._local_mode}`);
        if (this._local_mode) {
            console.log('mocking spanner');
            const mock = require('./mock/spanner');
            return new mock();
        } else {
            const CloudSpanner = require('./spanner');
            return  new CloudSpanner();
        }
    }
}