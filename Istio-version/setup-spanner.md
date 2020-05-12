## Overview

接下來我要建立一個Spanner Instance來存放我的遊戲資料. Spanner提供了全球部署的強一致性關聯式資料庫能力. 很適合在遊戲中存放需要全球一致的資料, 例如金額, 商店虛寶等等.

## References

[Spanner for Gaming Best Practice](https://cloud.google.com/solutions/best-practices-cloud-spanner-gaming-database)

[Spanner Data Types](https://cloud.google.com/spanner/docs/data-types)

[What DBAs need to know about Cloud Spanner, part 1: Keys and indexes](https://cloud.google.com/blog/products/gcp/what-dbas-need-to-know-about-cloud-spanner-part-1-keys-and-indexes)

[INT64 in Node.JS](https://nagachiang.github.io/implement-api-to-insert-and-read-int64-with-spanner-in-nodejs-chinese/#)

[How to count mutation](https://github.com/googleapis/google-cloud-go/issues/1721)

[Cloud Spanner Node.JS references](https://googleapis.dev/nodejs/spanner/latest/)

## Step-by-Step

首先建立一個Spanner Instance, 由於我要把Spanner跟Game Server跨區部署, 因此我會建立一個名為`game-spanner`的Spanner Instance在asia-northeast區域

由於只是範例, 因此建立的Spanner是一個Node的Regional Insance

```shell
gcloud spanner instances create game-spanner \
    --config=regional-asia-northeast1 \
    --nodes=1 \
    --description=game-spanner
```

接下來建立一個名為`mud`的新的資料庫

```shell
 gcloud spanner databases create mud --instance=game-spanner
```

接下來回到Google Cloud Console, 我要建立幾個Table

-   UserProfile
<!--
|  Column Name	| Column Type | Is PK	| Comment 	| 
|------|------|------|------|
|  ShardId	| INT64 	| | ShardId 	|  
|  PlayerId | String | | Player ID |
|  Email | String | | Player's email |
|  Nickname | String | | Player's nick name |
|  Balance | INT64 | | Player's credit balance |
-->
其中, Spanner會自動地針對插入的資料做Split, 如果太多資料被寫入到同一個Split, 那麼這個Split就會變成讀寫的瓶頸. 因此在這裡我的每一筆記錄前都會有一個隨機的ShardId, 並且作為Primary Key的第一個欄位. 這樣應該可以保證不會產生Hotspot

```sql
CREATE TABLE UserProfile (
	UUID STRING(36) NOT NULL,
	Balance INT64,
	BirthDay TIMESTAMP NOT NULL,
	CreateTime TIMESTAMP NOT NULL,
	DisableReason STRING(24),
	Email STRING(84) NOT NULL,
	Gender STRING(1) NOT NULL,
	HomeAddress STRING(64) NOT NULL,
	IsDisable BOOL,
	IsPromoted BOOL,
	MobilePhoneNumber STRING(16) NOT NULL,
	Nickname STRING(64) NOT NULL,
	PasswordHash STRING(64) NOT NULL,
	PlayerId STRING(64) NOT NULL,
	Tag STRING(64),
) PRIMARY KEY (UUID)

CREATE TABLE TransactionHistory(
    UUID STRING(36) NOT NULL,  
    PlayerId STRING(36) NOT NULL,    
    PurchasedItemID STRING(36) NOT NULL,
    PurchasedQuantity INT64 NOT NULL,
    TransactionTime TIMESTAMP NOT NULL,
    StoreChannelID STRING(36) NOT NULL
) PRIMARY KEY (UUID)


CREATE INDEX IX_PlayerProfileInGame_By_PlayerId 
ON UserProfile (
    PlayerId
) STORING (
    Email,
    Nickname,
    Balance,
    IsDisable,
    IsPromoted,
    Tag,
    DisableReason
)
CREATE INDEX IX_PlayerProfileOffGame_By_PlayerId 
ON UserProfile (
    PlayerId
) STORING (
    Email,
    Nickname,
    Balance,
    MobilePhoneNumber,
    BirthDay,
    HomeAddress,
    Gender,
    PasswordHash,
    IsDisable,
    DisableReason,
    IsPromoted,
    CreateTime
)



CREATE INDEX IX_TransactionHistory_By_PlayerId On TransactionHistory
(
    PlayerId, TransactionTime DESC
)
STORING(PurchasedItemID, PurchasedQuantity, StoreChannelID)

```
-   Avator
```sql

CREATE TABLE Avators(
    UUID STRING(36) NOT NULL,  
    PlayerId STRING(36) NOT NULL,    
    HP INT64 NOT NULL,
    MP INT64 NOT NULL,
    MAX_HP INT64, NOT NULL,
    MAX_MP INT64 NOT NULL,
    PlayerClass STRING(12) NOT NULL,
    PlayerLevel INT64 NOT NULL,
    IsOnline BOOL NOT NULL,
    CreateTime TIMESTAMP NOT NULL,
    Tags STRING(128) NOT NULL,
    SeqID INT64 NOT NULL
) PRIMARY KEY (UUID)

```
-   PlayerMatchHistory
<!--
|  Column Name	| Column Type 	|Is PK|  Comment 	| 
|------|------|------|------|
|  ShardId	| String 	| | ShardId 	|  	
|  PlayerId	| String | | Player Id/Name  	|  	
|  TargetId	| String 	| | Opponent Player Id/Name 	|  	
|  MatchTime | TimeStamp | | When did this match started |
|  MatchId | String | | How many times this player matches agaist this opponent |
-->
```sql
CREATE TABLE PlayerMatchHistory (
    MatchId STRING(36) NOT NULL,
    PlayerId STRING(10) NOT NULL,
    TargetId STRING(64) NOT NULL,
    MatchTime TIMESTAMP NOT NULL,
    RoomId STRING(36) NOT NULL
    DAMAGE INT64 NOT NULL
) PRIMARY KEY (MatchId);

CREATE INDEX IX_PlayerMatchHistory_By_MatchTime_DESC ON PlayerMatchHistory
(
    MatchTime DESC
)
STORING (PlayerId, TargetId, DAMAGE, RoomId);

CREATE INDEX IX_PlayerMatchHistory_By_PlayerId_MatchTime_DESC ON PlayerMatchHistory
(
    PlayerId,MatchTime DESC
)
STORING (PlayerId, TargetId, DAMAGE, RoomId);
```



-   Add new Node with Spanner Permission

```shell
gcloud beta container --project "kalschi-istio" node-pools create "spanner-pool" --cluster "gke2" --region "us-central1" --node-version "1.14.10-gke.37" --machine-type "e2-standard-4" --image-type "COS" --disk-type "pd-standard" --disk-size "100" --metadata disable-legacy-endpoints=true --scopes "https://www.googleapis.com/auth/cloud-platform" --num-nodes "1" --enable-autoupgrade --enable-autorepair --max-surge-upgrade 1 --max-unavailable-upgrade 0
```

```shell
kubectl apply -f ./assests/docker-data-api/configMap.yaml
kubectl apply -f ./assests/docker-data-api/app.yaml
kubectl apply -f ./assests/docker-data-api/route.yaml
```