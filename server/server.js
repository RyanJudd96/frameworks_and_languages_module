const express = require('express')
const app = express()
const port = 8000

app.use(express.json());


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
  }
]
//#endregion

//#region REQUESTS

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

app.get('/', (req, res) => {
  res.send('Server build successful!')
  res.status(200)
})

app.post('/item', (req, res) => {
  if(Object.keys(req.body).toString() !="user_id,keywords,description,lat,lon")
  {
    return res.status(405).json({"message": "missing fields"})
  }
  else
  {
    const currentDate = new Date().toISOString();
    const identifier = Math.random();

    req.body.id= identifier;
    req.body['date_from'] = currentDate;
    req.body['id'] = identifier;

    items.push(req.body)
    res.status(201).json()
    console.log("Successful POST Request")
  }
})

app.get('/items', (req, res) => {
  res.json(items)
  res.status(200).json("Message: ", "Successful GET requests")
})

app.get('/item/', (req, res) => {
  res.json(items[id])
})

//#endregion

process.on('SIGINT', function() {process.exit()})