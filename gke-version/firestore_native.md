## Overview

Firestore is the next version of Firebase and takes the best of Cloud Datastore and Firebase realtime. Adding Firestore real-time capabilities to the game enables players or game developers get live updates across the game world.

In this case, everytime when in-game player state changes, such as attacked by other players, the [game](./game-core/utils/firestore_native.js) updates Firestore collections to reflect latest player state. When players login or logout the game, latest player stastics are updated to Firestore. A Firestore snapshot listener gets latest updates from Firestore in near real-time.

```mermaid
sequenceDiagram

Players ->> InGameEventHandler: hp/mp/level changes
InGameEventHandler ->> firestore_native.js: update state
firestore_native.js ->> Firestore: Update/Insert documents
```

### Firestore Design

At the moment it's still very simple design

- PlayerState collection collects individual player state

```mermaid
classDiagram

PlayerState --|> Player

class Player {
    int hp
    int mp
    int playerLv
    string playerClass
    string name
}
```

- GameWorldStastic have latest in-game player lists

```mermaid
classDiagram
GameWorldStastic --|> Stastic

class Stastic{
    Date time
    string[] players
    string id
}
```

-   GameWorldBrocast logs every broadcast messages


```mermaid
classDiagram
GameWorldBrocast --|> Message
class Message{
    uuid id
    Date time
    string actor
    string target
    string message
}
```
