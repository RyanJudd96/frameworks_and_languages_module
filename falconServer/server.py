from wsgiref.simple_server import make_server

import falcon
import datetime
import random
import json

items = [
  {
    "id": 0,
    "user_id": "user1234",
    "keywords": ["hammer","nails","tools"],
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
    "keywords": ["hammer","nails","tools"],
    "description": "A hammer and nails set",
    "image": "https://placekitten.com/200/300",
    "lat": 51.2798438,
    "lon": 1.0830275,
    "date_from": "2023-10-23T13:12:39.844Z",
    "date_to": "2023-10-23T13:12:39.844Z"
  }
]

class getItems:
    def on_get(self, req, resp):
        """Handles GET requests"""
        resp.status = falcon.HTTP_200  # This is the default status
        resp.media = items

class postItem:
    def on_post(self, req, resp):
        """Handles POST requests"""
        itemData = json.loads(req.bounded_stream.read().decode("utf-8"))

        if itemData.get("user_id")!= None and itemData.get("keywords")!= None and itemData.get("description")!= None and itemData.get("lat")!= None and itemData.get("lon")!= None:

            date_to = datetime.datetime.now().isoformat()
            date_from = datetime.datetime.now().isoformat()
            id = (random.randint(1,10000)+random.randint(1,10000))
            
            fields = {
                "id" : id,
                "user_id" : itemData.get("user_id"),
                "keywords" : itemData.get("keywords"),
                "description" : itemData.get("description"),
                "image" : itemData.get("image"),
                "lat" : itemData.get("lon"),
                "lon" : itemData.get("lon"),
                "date_from" : date_from,
                "date_to" : date_to,
            }

            items.append(fields)
            resp.media = fields
            resp.status = falcon.HTTP_201
        else:
            
            resp.media = "Missing Fields!"
            resp.status = falcon.HTTP_405

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

# falcon.App instances are callable WSGI apps
# in larger applications the app is created in a separate file
app = falcon.App(cors_enable=True)

# Resources are represented by long-lived class instances
getItems = getItems()
postItem = postItem()
findItem = findItem()

# things will handle all requests to the '/things' URL path
app.add_route('/items', getItems)
app.add_route('/item', postItem)
app.add_route('/item/{id}', findItem)

if __name__ == '__main__':
    with make_server('', 8000, app) as httpd:
        print('Serving on port 8000...')

        # Serve until process is killed
        httpd.serve_forever()