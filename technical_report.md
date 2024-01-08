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

```python
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

```python
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

### Request and Response

In the falcon framework, incoming packets are handled by objects know as req/resp. The data from the packet is represented by "req", which allows access to the request data and passes information to the methods to be processed.
The "resp" object creates and send the HTTP response. Using "resp" you can customise the status code, headers, body etc, before passing it back as an argument to the resource methods.

```python
import falcon

class Resource:

    def on_get(self, req, resp):
        resp.media = {'message': 'Hello world!'}
        resp.status = falcon.HTTP_200

# -- snip --

app = falcon.App()
app.add_route('/', Resource())
```


(Explain the problem-this-is-solving/why/benefits/problems - 40ish words)

##### Documentation

https://falcon.readthedocs.io/en/stable/api/request_and_response.html


### ASGI, WSGI, and WebSocket Support:

The Falcon framework has support for both WSGI and ASGI, the older and more traditional synchronous version and another that follows a newer asynchronous specification. These specifications define how a web server communicates with its application, achieving this goal in different ways. 

#### WSGI
```python
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

```python
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

### URL Routing:

Falcon uses resource-based URl routing, which promotes the use of RESTful API structure to ensure standardisation. This involves each resource having a class containing all of the HTTP route methods.

```python
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

The use of resource-based/RESTful architecture means the design will be readable and scalable, and the requests are stateless, meaning all of the information needed for processing is contained within the request itself, simplifying the logic on the client-side. Utilising a standardised approach to building a web server will result in improved maintainability and system reliability.

##### Falcon URL Routing:

https://falcon.readthedocs.io/en/stable/api/routing.html


Server Language Features
-----------------------

### Clear and Readable Syntax:

The python language is a dynamic, asynchronous C based language that uses variable type assumptions and very simple syntax, such as the removal of semi colons and curly braces when ending lines or declaring functions. 

```python
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

##### Python Documentation:

https://www.python.org/doc/


### Expansive Standard Library/Modules:

The Python3 language comes pre-equipped with a large standard library of various modules for handling tasks, for example HTTP requests; web sockets; or data serialization. This extensive collection of libraries is easily available through the use of a simple import statement above your code block.

```python
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

##### Python/Module Documentation:

https://docs.python.org/3.12/

https://docs.python.org/3/howto/urllib2.html

Vue Client Framework Features
-------------------------

### Declarative Rendering:

Vue.js framework makes use of a feature known as declarative rendering. This allows the developer to render data directly to the Document Object Model(DOM) through the us of simple syntax. The data is inserted in the DOM using a pair of nested curly braces as placeholders, and the data can be reused/rendered multiple times throughout the codebase.

```javascript
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

##### Declarative Rendering Documentation/Tutorial:

https://vuejs.org/guide/introduction.html

https://www.geeksforgeeks.org/vue-js-declarative-rendering/


### Reactivity:

Vanilla javascript has no in-built capability to update the result of an algorithm if one of the original variables are changed, for example:

```
A1 = 1
A2 = 2

A3 = A1 + A2 = 3

A1 = 2
```

In this example A3 would still be equal to 3. Vue's reactivity feature allows for data to be retroactively changed, resulting in real-time updates.

##### Example:
```javascript
import { ref } from 'vue'

export default {
  // `setup` is a special hook dedicated for the Composition API.
  setup() {
    const count = ref(0)

    // expose the ref to the template
    return {
      count
    }
  }
}
```

This makes for a very responsive web page that reacts in real-time to the users inputs, making it particularly useful for use in single page web applications.

##### Documentation:

https://vuejs.org/guide/introduction.html

https://vuejs.org/guide/extras/reactivity-in-depth.html

### Directives

The Vue frameworks comes equipped with certain directives, specific markers that are used in the markup that cause the library to change some aspect of a DOM element. The most common directives include v-if, v-for, and v-bind to enable dynamic rendering of data.

```javascript
<ul>
  <li v-for="item in items">{{ item.name }}</li>
</ul>
```

These directives, along with others, provide a declarative way to handle various aspects of dynamic behavior in Vue.js applications. They contribute to the framework's ability to efficiently manage the DOM and keep it in sync with the application's state.

(Explain the problem-this-is-solving/why/benefits/problems - 40ish words)

##### Documentation:

https://vuejs.org/api/built-in-directives.html#built-in-directives


Javascript Client Language Features
------------------------

### Interpreted Language

Javascript is an interpreted language, meaning that the code is executed directly within the browser or runtime environment, without the need to compile the source code into machine code.The interpreter built into the browser or environment reads the source code line by line and executes it.
This means that the language is more flexible in terms of platform as there is no need for platform specific compilers, however this does require the interpreter to handle type related operations dynamically.

##### Documentation

https://www.tutorialspoint.com/How-is-JavaScript-an-interpreted-language

### Single-threaded (with Event Loop):

Because JavaScript is an interpreted language it is inherently single-threaded, but it makes use of event loops in order to deal with asynchronous operations. This allows it to efficiently process concurrent operations without needing to implement multi-threading.

```javascript
 console.log('A'); 
      
    setTimeout(() => { 
        console.log('B'); 
    }, 3000); 
          
    console.log('C'); 
```
This code in a single threaded language should print the letters in the order of A-B-C. However when the code is executed in the call stack and the first A is printed, the interpreter recognises the setTimeout() and places that operation in the call back stack. Next the interpreter moves on to execute the C operation, before checking the call back stack and completing the final operation.

This means that javascript can be asynchronous, preventing long running tasks from blocking the main thread. As a result the user experience is smooth and responsive, while maintaining efficient resource utilisation. This makes javascript a good choice for building dynamic web applications.

##### Documentation

https://www.geeksforgeeks.org/why-javascript-is-a-single-thread-language-that-can-be-non-blocking/

Conclusions
-----------

(justify why frameworks are recommended - 120ish words)
(justify which frameworks should be used and why 180ish words)

References
----------