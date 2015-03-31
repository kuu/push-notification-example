'use strict';

var https = require('https'),
    config = require('config'),
    fs = require('fs'),
    path = require('path'),
    express = require('express'),
    bodyParser = require('body-parser');

var app = express(),
    port = process.env.PORT || config.server.port,
    BASE_DIR = path.join(__dirname, '.'),
    DOCS_DIR = path.join(BASE_DIR, 'www'),
    DOCUMENT_PATH = path.join(DOCS_DIR, 'index.html'),
    TLS_DIR = path.join(BASE_DIR, config.tls.dir),
    subscriptionList = [];

app.use(express.static(DOCS_DIR));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.sendFile(DOCUMENT_PATH);
});

app.post('/subscribe', function (req, res) {
  console.log('POST /Subscribe:');
  console.log('subscriptionId: ' + req.body.id);
  var idx = subscriptionList.indexOf(req.body.id);
  if (idx === -1) {
    subscriptionList.push(req.body.id);
  }
  res.status(200);
});

app.post('/unsubscribe', function (req, res) {
  console.log('POST /Unsubscribe:');
  console.log('subscriptionId: ' + req.body.id);
  var idx = subscriptionList.indexOf(req.body.id);
  if (idx !== -1) {
    subscriptionList.splice(idx, 1);
  }
  res.status(200);
});

app.get('/pull', function (req, res) {
  res.send((new Date()).toString());
});

function multicast() {
  var data, options, req;

  if (subscriptionList.length === 0) {
    return;
  }

  data = JSON.stringify({'registration_ids': subscriptionList});

  options = {
    hostname: 'android.googleapis.com',
    port: 443,
    path: '/gcm/send',
    method: 'POST',
    headers: {
      'Authorization': 'key=AIzaSyCVpcIGEIrpkkdNQnM2J44I5FssQUwZPeU',
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  req = https.request(options, function (res) {
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      console.log('Response: ' + chunk);
    });
  });

  req.write(data);
  req.end();
}

// Start server
if (require.main === module) {
  if (app.get('env') === 'development') {
    // Development
    app.listen(port, function () {
      console.log('Server listening on port %s', port);
    });
  } else {
    // Production
    https.createServer({
      key: fs.readFileSync(path.join(TLS_DIR, config.tls.filepath.key)),
      cert: fs.readFileSync(path.join(TLS_DIR, config.tls.filepath.cert)),
      ca: config.tls.filepath.caList.map(function (filepath) {
              return fs.readFileSync(path.join(TLS_DIR, filepath));
            })
    }, app).listen(port, function () {
      console.log('Server listening on port %s', port);
    });
  }
  setInterval(multicast, 10000);
}

module.exports = app;
