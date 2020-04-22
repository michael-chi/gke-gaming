module.exports = class InGameMessage{
    constructor(userName, message){
        this._userName = userName;
        this._message = message;
    }
    notify(userName, message){
        this._userName = userName;
        this._message = message;
    }
    get notifyUser(){return this._userName;}
    get message(){return this._message;}
}