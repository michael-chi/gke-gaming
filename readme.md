## Setup Steps

### [GKE Version](./gke-version)

To setup this GKE version, first create a GKE cluster in your GCP project.

Connecto to your GKE cluster by running below commands

```bash
gcloud container clusters get-credentials $GKE_NAME --region $REGION
```

Once connected, execute below commands

```bash
cd gke-version/game-core
docker build . -t gcr.io/$PROJECT_ID/%IMAGE_NAME:%TAG
docker push gcr.io/$PROJECT_ID/%IMAGE_NAME:%TAG

kubectl apply -f ../k8s/mud-backendconfig.yaml
kubectl apply -f ../k8s/mud-deployment.yaml
kubectl apply -f ../k8s/mud-service.yaml
kubectl apply -f ../k8s/mud-ingress.yaml
```

Once deployed, wait for serveral minutes untill everything setup, then use a websocket client to verify functionality

### [Agones Integration](./agones-integration)