設定Game Server
==============

首先先建立Docker Image
```shell
cd game-core
sudo docker build . -f ../assests/docker-game-core/Dockerfile -t gcr.io/kalschi-istio/mud:gke-v21
sudo docker push gcr.io/kalschi-istio/mud:gke-v21
cd ..
```

原本的Deployment與Service yaml並不需要做太多的修改. 由於現在我們會透過Istio來做對外服務, 因此新增了Gateway與Virtual Service的定義
```yaml
apiVersion: networking.istio.io/v1alpha3
kind: Gateway
metadata:
  name: mud-gateway
spec:
  selector:
    istio: ingressgateway
  servers:
  - port:
      number: 80
      name: http
      protocol: HTTP
    hosts:
    - "*"
---
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: mud-virtualservice
spec:
  hosts:
  - "*"
  gateways:
  - mud-gateway
  http:
  - match:
    - uri:
        prefix: /
    route:
    - destination:
        host: mud
      weight: 100
```

修改`./assests/docker-game-core/configMap.yaml`, 將DATAAPI_URL修改為遠端GKE Load Balancer的位址
```yaml
  - address: xxx.xxx.xxx.xxx
```

部署Game Server到GKE上
```shell
gcloud container clusters get-credentials gke2 --region asia-northeast1 --project kalschi-istio
kubectl apply -f ./assests/docker-game-core/configMap.yaml 
kubectl apply -f ./assests/docker-game-core/dataapi-svc-entry.yaml 
kubectl apply -f ./assests/docker-game-core/app.yaml 
kubectl apply -f ./assests/docker-game-core/route.yaml 
```

找到Istio Gateway IP並以`ws://IP`連線