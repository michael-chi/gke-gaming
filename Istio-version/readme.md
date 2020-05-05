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

## Steps

[部署Game Server](setup-game-server.md)

[設定Logging](setup-logging.md)

[設定Istio與Stackdriver整合](setup-istio-stackdriver.md)

[建立Spanner Instance](setup-spanner.md)
