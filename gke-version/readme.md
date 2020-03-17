## Overvie

### Add Node Pool with Spanner access

Default GKE node pool does not have access to Cloud Spanner, if you didn't configure access permission when creating the cluster you will have to create a new node pool with Spanner access first.

```shell
export PROJECT_ID=kalschi-agones
export NODEPOOL_NAME=gke-spanner-pool
export CLUSTER_NAME=game-gke
gcloud beta container --project $PROJECT_ID node-pools create $NODEPOOL_NAME \
     --cluster $CLUSTER_NAME --zone "asia-east1-a" --node-version "1.14.10-gke.17" --machine-type "n1-standard-1" --image-type "COS" --disk-type "pd-standard" --disk-size "100" --metadata disable-legacy-endpoints=true --scopes "https://www.googleapis.com/auth/cloud-platform" --num-nodes "1" --enable-autoupgrade --enable-autorepair
```

You may than delete default node pool or use node selector to have your Pods scehduled in new node pool.

### Spanner Integration

Install Google Clud Spanner node sdk if not already

```shell
npm install @google-cloud/spanner -s
```

Go to Spanner and create a table

```sql

CREATE TABLE players (
    id STRING(36) NOT NULL,
    name STRING(36) NOT NULL,
    hp INT64 NOT NULL,
    mp INT64 NOT NULL,
    playerClass STRING(16) NOT NULL,
    playerLv INT64 NOT NULL,
) PRIMARY KEY (id, name)
CREATE INDEX PlayerProfile ON players(name, playerClass, playerLv)
```

Now we have Spanner and tables ready, we can than integrate our game with [Spanner](./game-core/utils/spanner.js). A high level overview of how event results are logged to Spanner is shown below.

```mermaid
sequenceDiagram

Player ->> app.js: command: login
app.js ->> spanner.js: EnsurePlayer()
Player ->> app.js: command: attack
app.js ->> CommandHandler: do: attack(target)
CommandHandler ->> spanner.js: FireEvent()
spanner.js ->> Cloud Spanner: log event
```

### Update Dockerfile and Yaml files

To use Spanner node.js SDK we need to make sure our environment runs grpc, I've updated my [Dockerfile](./game-core/Dockerfile) to reflect new requirements.

Our yaml files need to be modified to reflect new ports as well, I now need to pass in environment contains my [Spanner connection info](./k8s/mud-deployment.yaml)

### Deploy

```shell
sudo docker build . -t gcr.io/$PROJECT_ID/mud:latest
sudo docker push gcr.io/$PROJECT_ID/mud:latest
kubectl apply -f ./k8s/mud-deployment.yaml
kubectl apply -f ./k8s/mud-service.yaml
kubectl apply -f ./k8s/mud-ingress.yaml
```

