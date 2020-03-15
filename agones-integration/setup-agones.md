Overview
========
In Google Cloud platform, currently there are two ways to setup Agones server on GKE

-   Deploy Agones cluster
    -   [Click to Deploy](##click-to-deploy)
    -   [Manual setup](##manual-setup)

-   [Install required components](##install-agones-using-yaml)

-----
### Click to Deploy


Simply click on the [link](https://console.cloud.google.com/marketplace/details/google/agones), it will redirect to GCP marketplace page. Follow instruction to setup Agones Cluster.

----------
### Manual Setup


Follow [official instruction](https://agones.dev/site/docs/installation/creating-cluster/gke/) to setup and install required Agones components. You will need first have a GKE cluster.

----------
### Install Agones using Yaml

Once create Agones, run below commands to install required components

```bash
export CLUSTER_NAME=game-agones
export ZONE=asia-east1-b
gcloud container clusters get-credentials $CLUSTER_NAME --zone $ZONE

kubectl create namespace agones-system
kubectl apply -f https://raw.githubusercontent.com/googleforgames/agones/release-1.4.0/install/yaml/install.yaml
```


