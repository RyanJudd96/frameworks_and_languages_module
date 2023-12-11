# Client Side Framework README

## Overview

This README document outlines the basic deployment and functionality of these Vue/Bulma based client-side and Web Layout frameworks. 
Please find reference to the framework documentation at this URL (https://vuejs.org/guide/introduction.html) - (https://bulma.io/documentation/).

## Getting Started

This file does not need the framework packages installed locally, the webpage is served through the use of CDN imports in the head of the script.

To start running this client side server, use the following commands in the terminal to navigate to the appropriate folder and run the page.

```
$ cd client
$ python3 -m http.server 8001
```

Or you can instantiate a container using a the Dockerfile/Makefile with the following command.

```
$ make build && make run
```
## Linking the Two Frameworks

Once you have confirmed both the Server-side and Client-side servers are up and running in separate terminals, copy the URL of the server-side page and paste it on the end of client-side URL using the following syntax

```
http://client:8001/?api=http://server:8000/
```

This will link the two servers and enable full functionality to the web GET/POST/DELETE requests.