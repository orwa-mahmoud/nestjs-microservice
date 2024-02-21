## Description

## Installation

```bash
$ cp .env.example .env
``` 
##### make sure all to fill the values in .env

## build the images
```bash
$ docker compose build
```
##### Once docker containers are built, run below command to start containers.

```bash
$ docker compose up -d
```


## DataBase

##### Once docker containers are built and up, you can access to pgadmin at : 
##### http://localhost:5050/  : use the username and pwd you set them in .env to login in 
##### add new server :
```bash
host name / address : app-db (localhost : in case u are using pg admin not from the browser)
port 5432
```