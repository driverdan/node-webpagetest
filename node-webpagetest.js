var http = require('http');
var https = require('https');
var xml2js = require('xml2js');
var xmlParser = new xml2js.Parser();

// Use SSL
var ssl = false;
var apiHost = "www.webpagetest.org";

// Map stupid PHP file endpoints to nice REST urls
var urlMap = {
  tests: '/xmlResult/',
  'tests/run': '/runtest.php?f=xml',
  'tests/status': '/testStatus.php?f=xml',
  locations: '/getLocations.php?f=xml'
};

var doRequest = function(options, callback) {
  options.host = apiHost;
  options.method = options.method || "GET";

  var result = "";
  var req = ssl ? https : http;

  req.request(options, function(res) {
    res.on('data', function(data) {
      result += data;
    });

    res.on('end', function() {
      if (callback) {
        xmlParser.parseString(result, function(error, data) {
          callback(data);
        });
      }
    });

    res.on('close', function(err) {
      console.log("Connection closed", err);
    });
  })
  .on('error', function(e) {
    console.log('Problem with request: ' + e.message);
  })
  .end();
};

exports.get = function(endpoint, params, callback) {
  options = {
    path: urlMap[endpoint],
  };

  if (typeof params === "function") {
    callback = params;
    params = null;
  } else if (typeof params === "string") {
    options.path += params + "/";
  } else {
    for (i in params) {
      options.path += "&" + i + "=" + params[i];
    }
  }

  doRequest(options, callback);
};

exports.post = function(endpoint, params, callback) {
  options = {
    path: urlMap[endpoint],
  };

  if (typeof params === "function") {
    callback = params;
    params = null;
  } else if (typeof params === "string") {
    options.path += params + "/";
  } else {
    for (i in params) {
      options.path += "&" + i + "=" + params[i];
    }
  }

  doRequest(options, callback);
};
