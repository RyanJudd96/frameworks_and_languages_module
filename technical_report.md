FreeCycle Inc - Technical Report
================

Introduction
---------------------

This technical report is intended for use by both the client and any potential developers, and will cover both the current prototype and the proposed alternative web server. It will start with justification for the current solutions unsuitability for use in real world applications, followed by an overview of the features and reasoning for the choice of the particular frameworks used in the design of its replacement.

Critique of Server/Client prototype
---------------------

### Overview
This section go over some weaknesses in the design of the current prototype build, which was designed without the use of frameworks and their respective features. 

### No CORS Middleware Support

```
RESPONSE_DEFAULTS = {
    'code': 200, 
    'body': '',
    'Content-type': 'text/html; charset=utf-8',
    'Server': 'CustomHTTP/0.0 Python/3.9.0+',
    'Access-Control-Allow-Origin': '*',
    #'Date': 'Thu, 12 Aug 2021 10:02:02 GMT',  # TODO replace with strp format
}
```
This section of code shows that the line "'Access-Control-Allow-Origin': '*'," means the web server is vulnerable to being accessed by any domain origin, due to the lack of CORS middleware implementation.

### Improper handling of Multiple Packets

```
data = conn.recv(65535)  # If the request does not come though in a single recv/packet then this server will fail and will not composit multiple TCP packets. Sometimes the head and the body are sent in sequential packets. This happens when the system switches task under load.
                    #if not data: break
                    try:
                        request = parse_request(data)
                    except InvalidHTTPRequest as ex:
                        log.exception("InvalidHTTPRequest")
                        continue

                    # HACK: If we don't have a complete message - try to botch another recv - I feel dirty doing this 
                    # This probably wont work because utf8 decoded data will have a different content length 
                    # This needs more testing
                    while int(request.get('content-length', 0)) > len(request['body']):
                        request['body'] += conn.recv(65535).decode('utf8')

                    try:
                        response = func_app(request)
                    except Exception as ex:
                        log.error(request)
                        traceback.print_exc()
                        response = {'code': 500, 'body': f'<PRE>{traceback.format_exc()}</PRE>'}
```
This section of code shows that if a request comes through split into multiple packets, the web server will fail, and try to trace back to the origin domain to resend the data as a whole recv/packet.

### Recommendation

This current implementation is unsuitable for real world applications due to the lack of middleware and use of frameworks. While the issues above could be addressed, any expansion of this prototype would result in a overly complicated and unreadable set of files, making necessary maintenance for any third party developers very inconvenient.

The recommended approach would be to redesign the web server using industry standard server, client and web layout frameworks, in order to create a solution that makes use of all the provided features and support in an easy to read and expandable structure.

Falcon Server Framework Features
-------------------------

### (name of Feature 1)

```javascript
let items =
[
  {
    "id": 0,
    "user_id": "user1234",
    "keywords": [
      "hammer",
      "nails",
      "tools"
    ],
    "description": "A hammer and nails set",
    "image": "https://placekitten.com/200/300",
    "lat": 51.2798438,
    "lon": 1.0830275,
    "date_from": "2023-10-23T13:12:39.844Z",
    "date_to": "2023-10-23T13:12:39.844Z"
  },
  {
    "id": 1,
    "user_id": "user3000",
    "keywords": [
      "hammer",
      "nails",
      "tools"
    ],
    "description": "A hammer and nails set",
    "image": "https://placekitten.com/200/300",
    "lat": 51.2798438,
    "lon": 1.0830275,
    "date_from": "2023-10-23T13:12:39.844Z",
    "date_to": "2023-10-23T13:12:39.844Z"
  }
]
```


(Technical description of the feature - 40ish words)
(A code block snippet example demonstrating the feature)
(Explain the problem-this-is-solving/why/benefits/problems - 40ish words)
(Provide reference urls to your sources of information about the feature - required)


### ASGI, WSGI, and WebSocket support

The Falcon framework has support for both WSGI and ASGI, the older and more traditional synchronous version and another that follows a newer asynchronous specification. These specifications define how a web server communicates with its application, achieving this goal in different ways. 

#### WSGI
```
# examples/things.py

# Let's get this party started!
from wsgiref.simple_server import make_server

import falcon


# Falcon follows the REST architectural style, meaning (among
# other things) that you think in terms of resources and state
# transitions, which map to HTTP verbs.
class ThingsResource:
    def on_get(self, req, resp):
        """Handles GET requests"""
        resp.status = falcon.HTTP_200  # This is the default status
        resp.content_type = falcon.MEDIA_TEXT  # Default is JSON, so override
        resp.text = (
            '\nTwo things awe me most, the starry sky '
            'above me and the moral law within me.\n'
            '\n'
            '    ~ Immanuel Kant\n\n'
        )


# falcon.App instances are callable WSGI apps
# in larger applications the app is created in a separate file
app = falcon.App()

# Resources are represented by long-lived class instances
things = ThingsResource()

# things will handle all requests to the '/things' URL path
app.add_route('/things', things)

if __name__ == '__main__':
    with make_server('', 8000, app) as httpd:
        print('Serving on port 8000...')

        # Serve until process is killed
        httpd.serve_forever()
```

#### ASGI

```
# examples/things_asgi.py

import falcon
import falcon.asgi


# Falcon follows the REST architectural style, meaning (among
# other things) that you think in terms of resources and state
# transitions, which map to HTTP verbs.
class ThingsResource:
    async def on_get(self, req, resp):
        """Handles GET requests"""
        resp.status = falcon.HTTP_200  # This is the default status
        resp.content_type = falcon.MEDIA_TEXT  # Default is JSON, so override
        resp.text = (
            '\nTwo things awe me most, the starry sky '
            'above me and the moral law within me.\n'
            '\n'
            '    ~ Immanuel Kant\n\n'
        )


# falcon.asgi.App instances are callable ASGI apps...
# in larger applications the app is created in a separate file
app = falcon.asgi.App()

# Resources are represented by long-lived class instances
things = ThingsResource()

# things will handle all requests to the '/things' URL path
app.add_route('/things', things)
```

Due to WSGI being older its the more widely supported spec, however it doesn't allow for processing multiple requests at a time or when handling lengthy connections. ASGI addresses these issues by allowing concurrent requests and long-lived connections such as web sockets, making it a better option for real time applications.

##### WSGI Documentation:

https://falcon.readthedocs.io/en/stable/user/tutorial.html

##### ASGI Documentation:

https://falcon.readthedocs.io/en/stable/user/tutorial-asgi.html

### URL Routing

Falcon uses resource-based URl routing, which promotes the use of RESTful API structure to ensure standardisation. This involves each resource having a class containing all of the HTTP route methods.

```
class findItem:

    def on_get(self, req, resp, id):
        itemID = int(id)

        for i in items:
            if i['id'] == itemID:
                resp.status = falcon.HTTP_200
                resp.media = i
            else:
                resp.status = falcon.HTTP_404
                resp.media = "Item Not Found!"

    def on_delete(self, req, resp, id):
        deleteId = int(id)
        x = None

        for index, i in enumerate(items):
            if i['id'] == deleteId:
                x = index
                break
        if x == None:
            resp.status = falcon.HTTP_404
            resp.media = "Item Not Found!"
        else:
            items.pop(x)
            resp.status = falcon.HTTP_204
            resp.media = "Item Deleted!"

app = falcon.App(cors_enable=True)

# Resources are represented by long-lived class instances
getItems = getItems()
postItem = postItem()
findItem = findItem()
root = StaticResource()

# will handle all requests to the '/item' URL path
app.add_route('/items', getItems)
app.add_route('/item', postItem)
app.add_route('/item/{id}', findItem)
app.add_route('/', root)
```

The use of resource-based/RESTful architecture means the design will be readable and scalable, and the requests are stateless, meaning all of the information needed for processing is contained within the request itself. Utilising a standardised approach to building a web server will result in improved maintainability and system reliability.

##### Falcon URL Routing:

https://falcon.readthedocs.io/en/stable/api/routing.html


Server Language Features
-----------------------

### Clear and Readable Syntax

The python language is a dynamic, asynchronous C based language that uses variable type assumptions and very simple syntax, such as the removal of semi colons and curly braces when ending lines or declaring functions. 

```
# create a list of integers
my_list = [1, 2, 3, 4, 5]

# create an iterator from the list
iterator = iter(my_list)

# iterate through the elements of the iterator
for element in iterator:

    # Print each element
    print(element)
```

This makes writing code far faster and more efficient with less human error due to missed syntax, while making the code block as a whole much more human readable. This is particularly crucial for web development projects in which team collaboration and code readability are essential.

##### Python Documentation

https://www.python.org/doc/


### Expansive Standard Library/Modules

The Python3 language comes pre-equipped with a large standard library of various modules for handling tasks, for example HTTP requests; web sockets; or data serialization. This extensive collection of libraries is easily available through the use of a simple import statement above your code block.

```
import shutil
import tempfile
import urllib.request

with urllib.request.urlopen('http://python.org/') as response:
    with tempfile.NamedTemporaryFile(delete=False) as tmp_file:
        shutil.copyfileobj(response, tmp_file)

with open(tmp_file.name) as html:
    pass
```

This feature greatly simplifies the development of web servers as standardised built-in functionality is available for most common tasks, and all of the libraries are thoroughly documented and available on the python website.

##### Python/Module Documentation

https://docs.python.org/3.12/
https://docs.python.org/3/howto/urllib2.html

Client Framework Features
-------------------------

### Declarative Rendering

Vue.js framework makes use of a feature known as declarative rendering. This allows the developer to render data directly to the Document Object Model(DOM) through the us of simple syntax. The data is inserted in the DOM using a pair of nested curly braces as placeholders, and the data can be reused/rendered multiple times throughout the codebase.

```
<html> 
<head> 
    <script src= 
"https://cdn.jsdelivr.net/npm/vue@2/dist/vue.js"> 
    </script> 
</head> 
<body> 
    <div id='parent'> 
        <h3> 
          Welcome to the exciting world of {{name}} 
          </h3> 
        <script src='app.js'> 
      </script> 
    </div> 
</body> 
</html>
```
Using declarative Rendering means the developer doesn't have to write boilerplate code, allowing the framework to handle the underlying operations which results in cleaner and more efficient code.
This is also more maintainable as developers can edit the state without needing to edit complex code, resulting in improved code maintenance and reduces chance introducing bugs during patches.

##### Declarative Rendering Documentation/Tutorial

https://www.geeksforgeeks.org/vue-js-declarative-rendering/


### (name of Feature 2)

(Technical description of the feature - 40ish words)
(A code block snippet example demonstrating the feature)
(Explain the problem-this-is-solving/why/benefits/problems - 40ish words)
(Provide reference urls to your sources of information about the feature - required)


### (name of Feature 3)

(Technical description of the feature - 40ish words)
(A code block snippet example demonstrating the feature)
(Explain the problem-this-is-solving/why/benefits/problems - 40ish words)
(Provide reference urls to your sources of information about the feature - required)


Client Language Features
------------------------

### (name of Feature 1)

(Technical description of the feature - 40ish words)
(A code block snippet example demonstrating the feature)
(Explain the problem-this-is-solving/why/benefits/problems - 40ish words)
(Provide reference urls to your sources of information about the feature - required)

### (name of Feature 2)

(Technical description of the feature - 40ish words)
(A code block snippet example demonstrating the feature)
(Explain the problem-this-is-solving/why/benefits/problems - 40ish words)
(Provide reference urls to your sources of information about the feature - required)



Conclusions
-----------

(justify why frameworks are recommended - 120ish words)
(justify which frameworks should be used and why 180ish words)

References
----------