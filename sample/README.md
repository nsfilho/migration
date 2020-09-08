# Introduction

For test, you will need to run a docker with mongo. As sample `docker-compose.yml` bellow:

```yml
#
# Deploy command:
# docker stack deploy -c docker-compose.yml `basename $(pwd -P)`
#
# Author: Nelio Santos <nsfilho@icloud.com>
#
version: '3.6'

services:
    mongodb:
        image: mongo:4.4
        volumes:
            - mongodb:/data/db
        environment:
            MONGO_INITDB_ROOT_USERNAME: 'root'
            MONGO_INITDB_ROOT_PASSWORD: 'password'
            MONGO_INITDB_DATABASE: 'core'
        ports:
            - 27017:27017

volumes:
    mongodb:
```

## Running Test

```sh
MIGRATION_DEBUG_CONSOLE=true node --require ts-node/register --inspect ./index.ts
```
