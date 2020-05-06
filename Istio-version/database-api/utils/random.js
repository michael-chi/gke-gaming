module.exports = {
    randomString: function (length) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    },
    
    randomArbitrary: function (min, max) {
        return Math.round(Math.random() * (max - min)) + min;
    },
    
    sleep: function (s) {
        return new Promise(resolve => setTimeout(resolve, s * 1000));
    }
}