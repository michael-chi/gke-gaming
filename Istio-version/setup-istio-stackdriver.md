Overview
========
由Istio 1.4開始, Istio支援[匯出Temeletry到Stackdriver](https://github.com/istio/istio/wiki/Proxy-Based-Stackdriver-Telemetry)

REFERENCE
=========
[Customize Istio Installation](https://istio.io/docs/setup/install/istioctl/)

[Official Document - Install Istio on GKE](https://cloud.google.com/istio/docs/istio-on-gke/installing#enabling_sidecar_injection)

[Istio 1.5 - Metrics](https://istio.io/zh/docs/tasks/observability/metrics/collecting-metrics/)

Steps
=====
<!-- 首先必須Disable Istio-Telemetry
```shell
${HELM_PATH}/helm template ./temp/istio-1.5.2/install/kubernetes/helm/istio --name istio --namespace istio-system --set mixer.telemetry.enabled=false --set mixer.policy.enabled=false -->
```

啟用Trace, metadata exchange filter以及Stackdriver filter
```shell
kubectl -n istio-system apply -f https://raw.githubusercontent.com/istio/proxy/release-1.4/extensions/stats/testdata/istio/metadata-exchange_filter.yaml

kubectl -n istio-system apply -f https://raw.githubusercontent.com/istio/proxy/release-1.4/extensions/stackdriver/testdata/stackdriver_filter.yaml


```

<!-- 
${HELM_PATH}/helm template --set global.proxy.tracer="stackdriver" ./temp/istio-${ISTIO_VERSION}/install/kubernetes/helm/istio --name istio --namespace istio-system --set pilot.traceSampling=100 | kubectl apply -f - -->