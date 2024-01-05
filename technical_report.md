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
(suggested direction - frameworks 40ish words)


Server Framework Features
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


Server Language Features
-----------------------

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



Client Framework Features
-------------------------

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