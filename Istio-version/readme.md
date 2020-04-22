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

首先先建立Docker Image
```shell
cd game-core
sudo docker build . -f ../assests/docker-game-core/Dockerfile -t gcr.io/kalschi-istio/mud:gke-v21
sudo docker push gcr.io/kalschi-istio/mud:gke-v21
cd ..
```

部署Game Server到GKE上
```shell
gcloud container clusters get-credentials gke2 --region asia-northeast1 --project kalschi-istio
kubectl apply -f ./assests/docker-game-core/app.yaml 
kubectl apply -f ./assests/docker-game-core/route.yaml 
```

找到Istio Gateway IP並以`ws://IP`連線