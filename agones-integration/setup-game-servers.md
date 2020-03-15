Overview
========

Now that we have Agones cluster running, we will create a game server defination file to deploy our game to Agones cluster.

- [Prerequisties](##prerequisites)

- [Create game server fleets](##create-a-game-server-fleet)

- [Create Fleet Allocator](##create-fleet-allocator)

- [GOTCHA](##gotcha)


You can optionally install Ingress if you are using a private cluster, i,e, you will be load balance client traffic to game servers in a fleet. Our if you intent to expose node IP to clients and have them connect to one of these nodes directly, the this step can be skiped.


### Prerequisites

-   You must first have Agones enabled GKE cluster setup and ready

    GKE Cluster can be public or private, if you plan to access GKE cluster from outside of GCP (ex, kubectl), you must first add an authorized network.

### Create a game server fleet

Once Agones is deployed to GKE, connect to the GKE cluster

```bash
export CLUSTER_NAME=game-agones
export ZONE=asia-east1-b
gcloud container clusters get-credentials $CLUSTER_NAME --zone $ZONE
```

Agones peridocally check Game Server node health status by pinging http://NODE:8080/gshealthz, so I changed my game ports from 8080 to 9999.

Also, we need to tell Agones that our server is ready for use by calling Agones SDK. A full node.js sample can be found [here](https://github.com/googleforgames/agones/tree/release-1.4.0/examples/nodejs-simple/src)

```javascript
//  ...
await agonesSDK.ready();
```

In addition, depends on GKE node OS  version, you may want to rebuild all npm packages

```Dockerfile
run npm rebuild --unsafe-perm --build-from-source
```

Agones use concept of "Fleet" to manage a group of game servers, so first we will be creating a game server fleet

```yaml

apiVersion: "agones.dev/v1"
kind: Fleet
metadata:
  name: mud
spec:
  replicas: 1
  template:
    spec:
      ports:
      - name: default
        portPolicy: Static
        containerPort: 9999
        hostPort: 9999
        protocol: TCP
      health:
          # disable health check as we are not yet integrated with Agones SDK yet
          disable: true
          initialDelaySeconds: 10
          periodSeconds: 60
      template:
        spec:
          containers:
          - name: mud
            image: gcr.io/kalschi-agones/mud:v10
            imagePullPolicy: Always
            # resources:
            #   requests:
            #     memory: "64Mi"
            #     cpu: "20m"
            #   limits:
            #     memory: "64Mi"
            #     cpu: "20m"
```

Run below commands to create a fleet

```shell
export CLUSTER_NAME=game-agones
export ZONE=asia-east1-b
gcloud container clusters get-credentials $CLUSTER_NAME --zone $ZONE

kubectl apply -f agones/agones-game-fleet.yaml
```

Check it is running

```bash
kubectl get fleet
kubectl describe fleet
```


### Create Fleet Allocator

A fleet allocator manages your game server fleet size automatically based on actual laods

Create allocator
```yaml
apiVersion: "autoscaling.agones.dev/v1"
kind: FleetAutoscaler
metadata:
  name: mud-autoscaler
spec:
  fleetName: mud
  policy:
    type: Buffer
    buffer:
      bufferSize: 1
      minReplicas: 1
      maxReplicas: 2
      #maxReplicas: 1  # for demo and testing purpose, limit max replica to 1
```

Once created yaml, run below commands to create autoscaler

```bash
kubectl apply -f ./agones/agones-fleet-allocator.yaml
```

Check it in action
```bash
kubectl get fleetautoscaler
kubectl describe fleetautoscaler
```




### GOTCHA

- When writting in Node.JS, node version matters, while Agones supports Node.JS v13.5+, I encounters many issues in dependencies compatibility issues, mostly came from grpc node.js package. The [sample docker](https://github.com/googleforgames/agones/blob/release-1.4.0/examples/nodejs-simple/Dockerfile) file provided in official websites is the only correct combination of Agones SDK version, grpc version and node version which allows successful deployment.

