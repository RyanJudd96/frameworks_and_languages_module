const express = require('express')
const app = express()
const cors = require('cors')
const port = 8000

app.use(express.json());
app.use(cors())

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

//#region REQUESTS

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

app.get('/', (req, res) => {
  //posts basic text to the webpage to confirm success of server initialization
  res.send('Server build successful!')
  res.status(200)
})

app.post('/item', (req, res) => {

  if(!req.body.user_id || !req.body.keywords || !req.body.description || !req.body.lat || !req.body.lon)
  {
    //checks entered data is correct and returns error code and message in case of failure
    res.status(405).json({"message": "missing fields"})
    console.log("Error 404: Missing Fields")
    return;
  }
  else
  {
    //generates current date and random id number
    const dateFrom = new Date().toISOString();
    const dateTo = new Date().toISOString();
    const identifier = Math.random();
    req.body['date_from'] = dateFrom;
    req.body['date_to'] = dateTo;
    req.body['id'] = identifier;

    const elementField = {
      "id": identifier,
      "user_id": req.body.user_id,
      "keywords": req.body.keywords,
      "description": req.body.description,
      "image": req.body.image,
      "lat": req.body.lat,
      "lon": req.body.lon,
      "date_from": dateFrom,
      "date_to": dateTo,
    };

    items.push(elementField)
    console.log("Successful POST Request");
    return res.status(201).json(elementField)
    
  }
})

app.get('/items', (req, res) => {
  res.json(items)
  res.status(200).json("Message: ", "Successful GET requests")
})

app.get('/item/:id', (req, res) => {

  const id = parseFloat(req.params.id);

  const searchedItem = items.find(searchedItem => searchedItem.id === id);

  if(!searchedItem)
  {
    console.log("Error 404");
    res.status(404).json('Search Failed');
    return;
  }
  else
  {
    //console.log("User ID found!" + searchedItem);
    return res.status(200).json(searchedItem);
    
  }  
})

app.delete('/item/:id', (req, res) => {
  
  const Id = parseFloat(req.params.id);
  const itemToDelete = items.findIndex(item => item.id === Id);

  if(itemToDelete === -1)
  {
    console.log("Error 404");
    res.status(404).json('Item Not Found');
    return;
  }
  else
  {
    items.splice(itemToDelete, 1);
    console.log("User ID found! Item Deleted");
    res.status(204).json("Item Deleted");
    return;
  }
  
})

process.on('SIGINT', function() {process.exit()})