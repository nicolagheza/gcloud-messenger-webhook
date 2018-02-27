const
  express = require('express'),
  bodyParser = require('body-parser'),
  app = express().use(bodyParser.json()), // creates express http server
  webhook = require('./index.js').webhook;

app.all('/webhook', webhook)

// Sets server port and logs message on success
app.listen(process.env.PORT || 3000, () => console.log('webhook is listening'));
