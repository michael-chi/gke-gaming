## GKE Version

## Spanner Integration

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
