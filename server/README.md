# Server-Side Framework READ-ME

## Overview

This README document outlines the basic deployment and functionality of this Falcon based server-side framework. 
Please find reference to the framework documentation at this URL (https://falcon.readthedocs.io/en/stable/user/index.html).

## Getting started:

 In order to run this server, please navigate to the correct folder and ensure CORS and falcon have been downloaded and installed using the following commands. 

```
$ cd server
$ pip install -r requirements.txt
```

Once the required dependencies are installed, run the server using the following terminal command.

```
$ python server.py
```

Or you can instantiate the server within a container using the Dockerfile/Makefile.

```
$ make build && make run
```
## Testing HTTP Request Methods

To test each of the server request methods, please use the following CUrl commands to imitate a web request.

### POST Request

Enter this command into the terminal to post a new entry to the data structure and return a copy of the new item to the console.

```
$ curl -X POST http://localhost:8000/item -H "Content-Type: application/json" -d '{"user_id": "user1234", "keywords": ["hammer", "nails", "tools"], "description": "A hammer and nails set. In canterbury", "lat": 51.2798438, "lon": 1.0830275}'
```
### GET Item List Request

Enter this command into the terminal to access the server data structure and return the list of items to the console.

```
$ curl -X GET http://localhost:8000/items
```

or use | jq to return the same data in a more human readable format.

```
$ curl -X GET http://localhost:8000/items | jq
```

### GET Item by ID Request

Enter this command into the terminal to access the server data structure and locate a single item by ID number and return it to the console.

```
curl -X GET http://localhost:8000/item/1 | jq
```

### DELETE Item Request

Enter this command into the terminal to access the server data structure and locate and delete a single item by ID number.

```
curl -X DELETE http://localhost:8000/item/1
```
