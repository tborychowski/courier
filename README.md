# courier
A self-hosted parcel tracker.
Heavily inspired by [ParcelPony](https://github.com/fireshaper/parcelpony).

## Features
- nodejs version
- docker & docker-compose
- track almost any courier in the world

## TODO
- [ ] edit tracking?




## Setup
### Prerequisities
- Register at [trackinghive](https://my.trackinghive.com/) and get the API token (In Settings/API Keys)

### Run
Use this `docker-compose.yml`:
```yml
---
version: '3.7'
services:
  courier:
    container_name: courier
    image: tborychowski/courier
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - TOKEN=<trackinghive token>

```
That's it!
Now you can add & track your parcels from the web interface.
