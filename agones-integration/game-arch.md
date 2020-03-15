## Overview

I am writting a very basic text-based game which allows players to connect via websocket clients, input commands and interact with other players. A simple MUD (multi-user dungeon) game.

The game server is accepting websocket connection on port 8080 or 9999, depends on runtime environment.

## Flow Chart

Install [Mermaid chrome extension](https://chrome.google.com/webstore/detail/mermaid-diagrams/phfcghedmopjadpojhmmaffjmfiakfil) to view below flow diagram

```mermaid
sequenceDiagram
Player ->> Game Server: connect
Game Server ->> Player: notify login
Player ->> Game Server: [login]
Game Server ->> Game Server: apply user data randomly
Game Server ->> Player: show welcome message

loop Player
    Player ->> Game Server: send commands
    Game Server ->> Game Server: command process
    Game Server ->> Player: return results
end

```