const express = require('express')
const app = express()
const cors = require('cors')
const port = 8000

app.use(express.json());
app.use(cors())

//#region Dummy Data
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
//#endregion

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

  if(Object.keys(req.body).toString() !="user_id,keywords,description,lat,lon")
  {
    //checks entered data is correct and returns error code and message in case of failure
    res.status(405).json({"message": "missing fields"})
    console.log("Error 404: Missing Fields")
    return;
  }
  else
  {
    //generates current date and random id number
    const currentDate = new Date().toISOString();
    const identifier = Math.random();

    //creates a new field
    req.body.id= identifier;
    req.body['date_from'] = currentDate;
    req.body['id'] = identifier;

    items.push(req.body)
    return res.status(201).json(req.body)
    //console.log("Successful POST Request");
  }
})

app.get('/items', (req, res) => {
  res.json(items)
  res.status(200).json("Message: ", "Successful GET requests")
  return;
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

  const id = parseFloat(req.params.id);

  const itemToDelete = items.find(itemToDelete => itemToDelete.id === id);

  if(!itemToDelete)
  {
    console.log("Error 404");
    res.status(404).json('Item Not Found');
    return;
  }
  else
  {
    const x = items.splice(id, 1);
    console.log("User ID found! Item Deleted");
    res.status(204).json("Item Deleted");  
  }
})

//#endregion

process.on('SIGINT', function() {process.exit()})