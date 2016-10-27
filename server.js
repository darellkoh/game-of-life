var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded( { extended: true }));

app.use(morgan('dev'));
app.use(express.static(__dirname + '/js'));
app.use(express.static(__dirname + '/styles'));




// Listening
var port = 3000;
var PORT = process.env.PORT || port;

app.listen(PORT, function(){
  console.log('Listening on port ' + PORT);
});

// GET
app.get('/', function(req, res, next){
  res.sendFile(__dirname + '/index.html');
});

// Error handling
app.use(function(err, req, res, next){
  console.log(err);
  res.status(500).send(err.message);

});
