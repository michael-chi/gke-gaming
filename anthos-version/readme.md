## Overview

## Steps-by-Steps

Enable Anthos API

Go to Anthos Console

Create Two Clusters without enabling Istio add-on

Register created clusters to Anthos

[Install Servish Mesh](https://cloud.google.com/service-mesh/docs/gke-install-existing-cluster)

```shell
export PROJECT_ID=kalschi-istio
gcloud config set project ${PROJECT_ID}
export PROJECT_NUMBER=$(gcloud projects describe ${PROJECT_ID} --format="value(projectNumber)")
export GCP_USERACCOUNT=kalschi@google.com

gcloud projects add-iam-policy-binding ${PROJECT_ID} \
     --member user:$GCP_USERACCOUNT \
     --role=roles/editor \
     --role=roles/container.admin \
     --role=roles/resourcemanager.projectIamAdmin \
     --role=roles/iam.serviceAccountAdmin \
     --role=roles/iam.serviceAccountKeyAdmin \
     --role=roles/gkehub.admin

gcloud services enable \
    container.googleapis.com \
    compute.googleapis.com \
    monitoring.googleapis.com \
    logging.googleapis.com \
    meshca.googleapis.com \
    meshtelemetry.googleapis.com \
    meshconfig.googleapis.com \
    iamcredentials.googleapis.com \
    anthos.googleapis.com \
    gkeconnect.googleapis.com \
    gkehub.googleapis.com \
    cloudresourcemanager.googleapis.com

```

[Setup an existing GKE cluster](https://cloud.google.com/service-mesh/docs/gke-install-existing-cluster#setting_up_an_existing_cluster)

```shell
gcloud components update
export CLUSTER_NAME=anthos-1
export CLUSTER_LOCATION=asia-east1-a
export WORKLOAD_POOL=${PROJECT_ID}.svc.id.goog
export MESH_ID="proj-${PROJECT_NUMBER}"
gcloud config set compute/zone ${CLUSTER_LOCATION}

gcloud container clusters update ${CLUSTER_NAME} \
  --update-labels=mesh_id=${MESH_ID}
# gcloud container clusters update ${CLUSTER_NAME} \
#   --update-labels=mesh_id=${MESH_ID},${EXISTING_LABELS}

# Enable Workload Identity
gcloud container clusters update ${CLUSTER_NAME} \
   --workload-pool=${WORKLOAD_POOL}

# Enable Cloud Monitoring and Logging
gcloud container clusters update ${CLUSTER_NAME} \
   --enable-stackdriver-kubernetes

# Enroll Release channel: regular, stable or rapid
gcloud beta container clusters update ${CLUSTER_NAME} \
   --release-channel=regular
```

Setup Credential

```shell
curl --request POST \
  --header "Authorization: Bearer $(gcloud auth print-access-token)" \
  --data '' \
  https://meshconfig.googleapis.com/v1alpha1/projects/${PROJECT_ID}:initialize

gcloud container clusters get-credentials ${CLUSTER_NAME}

kubectl create clusterrolebinding cluster-admin-binding \
  --clusterrole=cluster-admin \
  --user="$(gcloud config get-value core/account)"
```


Optionally Register Cluster and download Keyfile if not already

```shell
export SERVICE_ACCOUNT_NAME=SERVICE_ACCOUNT_NAME
gcloud iam service-accounts create ${SERVICE_ACCOUNT_NAME}
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
   --member="serviceAccount:${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com" \
   --role="roles/gkehub.connect"

export SERVICE_ACCOUNT_KEY_PATH=LOCAL_KEY_PATH
gcloud iam service-accounts keys create ${SERVICE_ACCOUNT_KEY_PATH} \
   --iam-account=${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com

# Register Cluster
export MEMBERSHIP_NAME=KALSCHI_GAME_SERVERS

gcloud container hub memberships register MEMBERSHIP_NAME \
--gke-cluster=${CLUSTER_LOCATION}/${CLUSTER_NAME} \
--service-account-key-file=${SERVICE_ACCOUNT_KEY_PATH}


```


[Preparing to Install Service Mesh](https://cloud.google.com/service-mesh/docs/gke-install-existing-cluster#preparing_to_install_anthos_service_mesh)

```shell
mkdir temp
cd temp
curl -LO https://storage.googleapis.com/gke-release/asm/istio-1.4.7-asm.0-linux.tar.gz

# Download signature file and verify it by openssl
curl -LO https://storage.googleapis.com/gke-release/asm/istio-1.4.7-asm.0-linux.tar.gz.1.sig
openssl dgst -verify - -signature istio-1.4.7-asm.0-linux.tar.gz.1.sig istio-1.4.7-asm.0-linux.tar.gz <<'EOF'
-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEWZrGCUaJJr1H8a36sG4UUoXvlXvZ
wQfk16sxprI2gOJ2vFFggdq3ixF2h4qNBt0kI7ciDhgpwS8t+/960IsIgw==
-----END PUBLIC KEY-----
EOF


tar xzf istio-1.4.7-asm.0-linux.tar.gz

cd istio-1.4.7-asm.0

export PATH=$PWD/bin:$PATH
```

[Installing Anthos Service Mesh](https://cloud.google.com/service-mesh/docs/gke-install-existing-cluster#installing_anthos_service_mesh)

```shell

```