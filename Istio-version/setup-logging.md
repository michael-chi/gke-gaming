Overview
========

為了更好的監控遊戲運行的狀態, 接下來我想要將遊戲內的資訊寫到Stackdriver中, 以方便查詢跟Troubleshooting.
在GKE上Kubernetes Engine Monitoring是預設開啟的, 因此我需要做的就是在程式中將我的訊息格式好. 預設會收集[System Log和Applicaton Log](https://cloud.google.com/monitoring/kubernetes-engine/installing), 應用程式的stdio, stderr訊息也會被收集, 然而, 其格式是文字格式, 不易查詢. 
在Stackdriver支援[Structured Logs](https://cloud.google.com/logging/docs/structured-logging?hl=zh-tw), 我們可以透過API格式化要送到Stackdriver Logging中的訊息

Steps
=====

我們有幾個Client Library的[選擇](https://cloud.google.com/logging/docs/setup/nodejs#installing_the_plugin_2), 在這邊我使用Winston

依照文件的步驟安裝node.js package, 並修改`logger.js`

```javascript
const {LoggingWinston} = require('@google-cloud/logging-winston');
const loggingWinston = new LoggingWinston();

const logger = winston.createLogger({
  level: 'info',
  transports: [
    new winston.transports.Console(),
    loggingWinston,
  ],
});


module.exports = function log(msg, param, source, severity) {
    logger.info({
        message:msg,
        timestamp:Date.now(),
        param:param,
        source:source,
        severity:severity
    });
};
```


