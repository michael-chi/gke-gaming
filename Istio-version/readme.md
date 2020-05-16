Overview
========

假如已經建立好GKE Cluster, 也已經安裝好了Istio, 接下來我們要利用Istio來做遊戲的管理監控.

## Pre-requesists

開始之前, 確認已經完成以下的準備事項
- [安裝並設定好Istio on GKE Clusters](https://github.com/michael-chi/gcp-handson/tree/master/istio-multi-gke-cluster-connectivity)


## Component Table

|GKE Cluster|Component|
|:---------:|:-------:|
|gke1|Database Services|
|gke2|Game Server|

|Parameter|Value|
|:---------:|:-------:|
|Project_ID|kalschi-istio|


## Architecture

[系統架構在這裡](https://drive.google.com/file/d/1hApARM2aIjqGswy3p2C26IGn6kwWFz_J/view?usp=sharing)

## Demo Script

-   以任何WebSocket Client連線到ws://34.80.239.146/

-   輸入`login Buddy_Henderickson-dhPG8MJ0g6`登入, 請注意大小寫

-   可以使用以下指令

|指令|Component|範例|對資料庫影響｜
|:---------:|:-------:|:-------:|:-------:|
|login \<id\>|登入玩家|login tester001|讀取Firestore::players Entity|
||||更新Firestore::GameServer entity以反映最新上線人數 |
||||更新Firestore::Players entity以反映最新上線時間 |
|attack \<id\>|攻擊玩家|attack tester001|修改Firestore::players的Entity狀態|
||||新增一筆MatchHistory到Spanner|
|look \<id\>|觀察環境或人物|look||
|look \<id\>||look tester001||
|stat|顯示自身狀態|stat||
|quit|離開遊戲|quit|修改Firestore::players的Entity狀態|
||||更新Firestore::GameServer entity以反映最新上線人數 |

## 部署步驟

[部署Game Server](setup-game-server.md)

[設定Logging](setup-logging.md)

[設定Istio與Stackdriver整合](setup-istio-stackdriver.md)

[建立Spanner Instance](setup-spanner.md)
