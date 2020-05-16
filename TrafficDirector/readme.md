1. Create 2 Projects and in each create a custom mode VPC in different regions

2. Create Peering to peer both VPCs

```shell

gcloud beta container --project "kalschi-td-001" \
clusters create "gke-us" --zone "us-central1-b" \
--no-enable-basic-auth --cluster-version "1.14.10-gke.27" \
--machine-type "e2-standard-4" --image-type "COS" \
--disk-type "pd-standard" \
--disk-size "100" --metadata disable-legacy-endpoints=true \
--scopes "https://www.googleapis.com/auth/cloud-platform" --num-nodes "1" \
--enable-stackdriver-kubernetes --enable-private-nodes \
--master-ipv4-cidr "192.168.200.0/28" --enable-master-global-access \
--enable-ip-alias --network "projects/kalschi-td-001/global/networks/vpc-td-us" \
--subnetwork "projects/kalschi-td-001/regions/us-central1/subnetworks/td-us-central	" \
--default-max-pods-per-node "110" --no-enable-master-authorized-networks \
--addons HorizontalPodAutoscaling,HttpLoadBalancing \
--enable-autoupgrade --enable-autorepair --max-surge-upgrade 1 --max-unavailable-upgrade 0


gcloud beta container --project "kalschi-td-002" clusters create "gke-tw" --zone "asia-east1-a" --no-enable-basic-auth --cluster-version "1.14.10-gke.27" --machine-type "e2-standard-4" --image-type "COS" --disk-type "pd-standard" --disk-size "100" --metadata disable-legacy-endpoints=true --scopes "https://www.googleapis.com/auth/cloud-platform" --num-nodes "1" --enable-stackdriver-kubernetes --enable-private-nodes --master-ipv4-cidr "172.16.0.0/28" --enable-master-global-access --enable-ip-alias --network "projects/kalschi-td-002/global/networks/vpc-td-tw" --subnetwork "projects/kalschi-td-002/regions/asia-east1/subnetworks/td-tw" --default-max-pods-per-node "110" --no-enable-master-authorized-networks --addons HorizontalPodAutoscaling,HttpLoadBalancing --enable-autoupgrade --enable-autorepair --max-surge-upgrade 1 --max-unavailable-upgrade 0
```

-   Get Credentials

```shell

gcloud compute firewall-rules create fw-allow-health-checks \
    --network vpc-td-us \
    --action ALLOW \
    --direction INGRESS \
    --source-ranges 35.191.0.0/16,130.211.0.0/22 \
    --rules tcp


gcloud compute firewall-rules create fw-allow-health-checks \
    --network vpc-td-tw \
    --action ALLOW \
    --direction INGRESS \
    --source-ranges 35.191.0.0/16,130.211.0.0/22 \
    --rules tcp

```