## Overview

接下來我要建立一個Spanner Instance來存放我的遊戲資料. Spanner提供了全球部署的強一致性關聯式資料庫能力. 很適合在遊戲中存放需要全球一致的資料, 例如金額, 商店虛寶等等.

## References

[Spanner Data Types](https://cloud.google.com/spanner/docs/data-types)

[What DBAs need to know about Cloud Spanner, part 1: Keys and indexes](https://cloud.google.com/blog/products/gcp/what-dbas-need-to-know-about-cloud-spanner-part-1-keys-and-indexes)

[INT64 in Node.JS](https://nagachiang.github.io/implement-api-to-insert-and-read-int64-with-spanner-in-nodejs-chinese/#)

[How to count mutation](https://github.com/googleapis/google-cloud-go/issues/1721)

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

|  Column Name	| Column Type | Is PK	| Comment 	| 
|------|------|------|------|
|  ShardId	| INT64 	| | ShardId 	|  
|  PlayerId | String | | Player ID |
|  Email | String | | Player's email |
|  Nickname | String | | Player's nick name |
|  LastLoginTime | Timestamp| | Last login time |
|  IsOnLine | BOOL | | Is the player currently online |


```sql
CREATE TABLE UserProfile (
    ShardId INT64 NOT NULL,
    PlayerId STRING(36) NOT NULL,
    Email STRING(64) NOT NULL,
    Nickname STRING(64) NOT NULL,
    LastLoginTime TIMESTAMP NOT NULL, 
    IsOnLine BOOL NOT NULL
) PRIMARY KEY (ShardId, PlayerId);

```

-   PlayerMatchHistory

|  Column Name	| Column Type 	|Is PK|  Comment 	| 
|------|------|------|------|
|  ShardId	| String 	| | ShardId 	|  	
|  PlayerId	| String | | Player Id/Name  	|  	
|  TargetId	| String 	| | Opponent Player Id/Name 	|  	
|  MatchTime | TimeStamp | | When did this match started |
|  MatchId | String | | How many times this player matches agaist this opponent |

```sql
CREATE TABLE PlayerMatchHistory (
    ShardId INT64 NOT NULL,
    MatchId STRING(36) NOT NULL,
    PlayerId STRING(10) NOT NULL,
    TargetId STRING(64) NOT NULL,
    MatchTime TIMESTAMP NOT NULL,
) PRIMARY KEY (ShardId, MatchId);

```

建立Index

```sql
CREATE INDEX IX_PlayerProfile_By_PlayerId ON UserProfile
(
    PlayerId
)
STORING (Email, Nickname, LastLoginTime, IsOnLine);

CREATE INDEX IX_PlayerMatchHistory_By_PlayerId ON PlayerMatchHistory
(
    PlayerId 
)
STORING (MatchTime, TargetId);


CREATE INDEX IX_PlayerMatchHistory_By_MatchTime_DESC ON PlayerMatchHistory
(
    MatchTime DESC
)
STORING (PlayerId, TargetId);
```